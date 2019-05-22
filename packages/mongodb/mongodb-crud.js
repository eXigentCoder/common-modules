'use strict';
const { createOutputMapper } = require('../validation');
const { createVersionInfoSetter } = require('../version-info');
const get = require('lodash/get');
const { EntityNotFoundError } = require('../common-errors');
const createGetIdentifierQuery = require('./create-identifier-query');
const createMongoDbAuditors = require('./create-mongodb-auditors');
const ObjectId = require('mongodb').ObjectId;

// TODO : Add an audit writer (Mongodb/pub/sub/Firebase etc)
// TODO : Go over old CRUD and see that I haven't missed anything
// TODO : Need to look at auth so can do:
//        * User/group/role based access
//        * Ownership
// TODO : Ability to store statuses (and associated mini workflow/rules?) on the object/metadata
/**
 * @typedef {import('../version-info/create-version-info-setter').ExecutionContext} ExecutionContext
 * @typedef {import('./query-string-to-mongo-query').Query} Query
 * @typedef {import('../version-info/create-version-info-setter').SetVersionInfo} SetVersionInfo
 * @typedef {import('../entity-metadata').EntityMetadata} EntityMetadata
 * @typedef {import('../validation/ajv').Validator} Validator
 * @typedef {import('../validation/create-output-mapper').MapOutput} MapOutput
 * @typedef {import('mongodb').Db} Db
 * @typedef {import('mongodb').Collection} Collection
 * @typedef {import('./create-identifier-query').GetIdentifierQuery} GetIdentifierQuery
 *
 * @typedef {Object} Auditors
 * @property {(entityAfterCreation:Object,context:ExecutionContext)=>Promise<void>} writeCreation
 * @property {(deletedObject:Object,context:ExecutionContext)=>Promise<void>} writeDeletion
 * @property {(oldEntity:Object,newEntity:Object,context:ExecutionContext)=>Promise<void>} writeReplacement
 *
 * @typedef {Object} Utilities
 * @property {SetVersionInfo} setVersionInfo
 * @property {Db} db
 * @property {Collection} collection
 * @property {MapOutput} mapOutput
 * @property {EntityMetadata} metadata
 * @property {SetStringIdentifier} setStringIdentifier
 * @property {GetIdentifierQuery} getIdentifierQuery
 * @property {Validator} inputValidator
 * @property {Validator} outputValidator
 * @property {Auditors} auditors
 *
 * @typedef {(item:Object)=>void} SetStringIdentifier
 *
 * @typedef {(entity:Object,context:ExecutionContext)=>Promise<Object>} Create
 * @typedef {(id:String)=>Promise<Object>} GetById
 * @typedef {(id:String,context:ExecutionContext)=>void} DeleteById
 * @typedef {(entity:Object,context:ExecutionContext)=>Promise<Object>} ReplaceById
 * @typedef {(query:Query)=>Promise<Object[]>} Search
 *
 * @typedef {Object} Crud
 * @property {Create} create
 * @property {GetById} getById
 * @property {DeleteById} deleteById
 * @property {ReplaceById} replaceById
 * @property {Search} search
 *
 * @typedef {Object} CreateUtilityParams
 * @property {EntityMetadata} metadata
 * @property {Validator} inputValidator
 * @property {Validator} outputValidator
 * @property {Db} db
 * @property {Auditors} [auditors]
 */

/**
 * @param {CreateUtilityParams} params Parameters used to create the utilities
 * @returns {Promise<Utilities>} A promise which resolves to the utilties
 */
async function getUtils({ metadata, inputValidator, outputValidator, db, auditors }) {
    const setVersionInfo = createVersionInfoSetter({ metadata, validator: inputValidator });
    const collection = db.collection(metadata.collectionName);
    const mapOutput = createOutputMapper(metadata.schemas.output.$id, outputValidator);
    const setStringIdentifier = createStringIdentifierSetter(metadata);
    const getIdentifierQuery = createGetIdentifierQuery(metadata);
    auditors = auditors || (await createMongoDbAuditors(metadata, db));
    return {
        setVersionInfo,
        db,
        collection,
        mapOutput,
        metadata,
        setStringIdentifier,
        getIdentifierQuery,
        inputValidator,
        outputValidator,
        auditors,
    };
}

/**
 * @param {CreateUtilityParams} utilities The input utilities to create the function
 * @returns {Promise<Crud>} A promise which resolves to the CRUD methods
 */
async function getCrud({ metadata, inputValidator, outputValidator, db }) {
    const utils = await getUtils({
        metadata,
        inputValidator,
        outputValidator,
        db,
    });
    return {
        create: getCreate(utils),
        getById: getGetById(utils),
        deleteById: getDeleteById(utils),
        replaceById: getReplaceById(utils),
        search: getSearch(utils),
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {Create} A function to create entities
 */
function getCreate({
    setVersionInfo,
    collection,
    mapOutput,
    metadata,
    setStringIdentifier,
    inputValidator,
    auditors,
}) {
    return async function create(_entity, context) {
        const entity = JSON.parse(JSON.stringify(_entity));
        inputValidator.ensureValid(metadata.schemas.create.$id, entity);
        setStringIdentifier(entity);
        setVersionInfo(entity, context);
        await collection.insertOne(entity);
        auditors.writeCreation(entity, context);
        mapOutput(entity);
        return entity;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {GetById} A function to get entities by their identifiers
 */
function getGetById({ collection, mapOutput, getIdentifierQuery, metadata }) {
    return async function getById(id) {
        const query = getIdentifierQuery(id);
        const item = await collection.findOne(query);
        if (!item) {
            throw new EntityNotFoundError(metadata.title, id);
        }
        mapOutput(item);
        return item;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {DeleteById} A function to delete entities by their identifier
 */
function getDeleteById({ collection, getIdentifierQuery, metadata, auditors }) {
    return async function deleteById(id, context) {
        const query = getIdentifierQuery(id);
        const result = await collection.findOneAndDelete(query);
        if (!result.value) {
            throw new EntityNotFoundError(metadata.title, id);
        }
        auditors.writeDeletion(result.value, context);
        return;
    };
}
/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {ReplaceById} A function to replace documents based off of their _id
 */
function getReplaceById({
    setVersionInfo,
    collection,
    mapOutput,
    metadata,
    inputValidator,
    auditors,
}) {
    return async function replaceById(_entity, context) {
        const entity = JSON.parse(JSON.stringify(_entity));
        // comes from outside, can't be trusted
        delete entity.versionInfo;
        const _id = entity._id;
        delete entity._id;
        inputValidator.ensureValid(metadata.schemas.replace.$id, entity);
        const query = { _id: new ObjectId(_id) };
        const existing = await collection.findOne(query);
        if (!existing) {
            throw new EntityNotFoundError(metadata.title, _id);
        }
        entity.versionInfo = existing.versionInfo;
        // todo Unique key constratints should take care of changing the identifier, but need to return a nice error message if it fails. is the id just a nice URL slug? should it stay the same forever?
        setVersionInfo(entity, context);
        const replaceResult = await collection.findOneAndReplace(query, entity);
        entity._id = _id;
        auditors.writeReplacement(replaceResult.value, entity, context);
        mapOutput(entity);
        return entity;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {Search} A function to search for entities
 */
function getSearch({ collection, mapOutput }) {
    return async function search(query) {
        const { filter, skip, limit, sort, projection } = query;
        const items = await collection
            .find(filter)
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .project(projection)
            .toArray();
        mapOutput(items);
        return items;
    };
}

module.exports = { getUtils, getCrud };

/**
 * @param {EntityMetadata} metadata The entity metadata containing the rules for the string identifier
 * @returns {SetStringIdentifier} The function to set the string identifier on an object
 */
function createStringIdentifierSetter(metadata) {
    return function setStringIdentifier(item) {
        if (!metadata.stringIdentifier) {
            return;
        }
        if (metadata.stringIdentifier.source) {
            item[metadata.stringIdentifier.name] = metadata.titleToStringIdentifier(
                get(item, metadata.stringIdentifier.source)
            );
        }
    };
}
