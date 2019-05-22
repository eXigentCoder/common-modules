'use strict';
const { createOutputMapper } = require('../validation');
const { createVersionInfoSetter } = require('../version-info');
const ObjectId = require('mongodb').ObjectID;
// TODO : Remove direct boom reference
const { badRequest } = require('@hapi/boom');
const util = require('util');
const get = require('lodash/get');
const { EntityNotFoundError } = require('../common-errors');

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
 *
 * @typedef {(item:Object)=>void} SetStringIdentifier
 * @typedef {(identifier:string)=>Object} GetIdentifierQuery
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
 */

/**
 * @param {CreateUtilityParams} params Parameters used to create the utilities
 * @returns {Promise<Utilities>} A promise which resolves to the utilties
 */
async function getUtils({ metadata, inputValidator, outputValidator, db }) {
    const setVersionInfo = createVersionInfoSetter({ metadata, validator: inputValidator });
    const collection = db.collection(metadata.collectionName);
    const mapOutput = createOutputMapper(metadata.schemas.output.$id, outputValidator);
    const setStringIdentifier = createStringIdentifierSetter(metadata);
    const getIdentifierQuery = createGetIdentifierQuery(metadata);
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
}) {
    return async function create(_entity, context) {
        const entity = JSON.parse(JSON.stringify(_entity));
        inputValidator.ensureValid(metadata.schemas.create.$id, entity);
        setStringIdentifier(entity);
        setVersionInfo(entity, context);
        await collection.insertOne(entity);
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
function getDeleteById({ collection, getIdentifierQuery }) {
    return async function deleteById(id, context) {
        //todo audit deletion using context
        const query = getIdentifierQuery(id);
        await collection.findOneAndDelete(query);
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
    getIdentifierQuery,
    inputValidator,
}) {
    return async function replaceById(_entity, context) {
        const entity = JSON.parse(JSON.stringify(_entity));
        // comes from outside, can't be trusted
        delete entity.versionInfo;
        const id = entity[metadata.identifier.name];
        delete entity[metadata.identifier.name];
        inputValidator.ensureValid(metadata.schemas.replace.$id, entity);
        const query = getIdentifierQuery(id);
        const existing = await collection.findOne(query);
        if (!existing) {
            throw new EntityNotFoundError(metadata.title, id);
        }
        entity.versionInfo = existing.versionInfo;
        // todo Unique key constratints should take care of changing the identifier, but need to return a nice error message if it fails. is the id just a nice URL slug? should it stay the same forever?
        setVersionInfo(entity, context);
        const replaceResult = await collection.findOneAndReplace(query, entity, {
            returnOriginal: false,
        });
        const updatedEntity = replaceResult.value;
        mapOutput(updatedEntity);
        return updatedEntity;
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
        item[metadata.stringIdentifier.name] = metadata.titleToStringIdentifier(
            get(item, metadata.stringIdentifier.source)
        );
    };
}

/**
 * @param {EntityMetadata} metadata The entity metadata containing the rules for identifiers
 * @returns {GetIdentifierQuery} The function to set the get the right mongodb query based on the type of supplied identifier
 */
function createGetIdentifierQuery(metadata) {
    const { stringIdentifier, identifier: identifierName } = metadata;
    return function getIdentifierQuery(identifierValue) {
        if (identifierValue === null || identifierValue === undefined) {
            throw badRequest(
                `"${stringIdentifier.name}" or ${
                    identifierName
                } is required as an identifier to refer to a ${metadata.title}`
            );
        }
        if (ObjectId.isValid(identifierValue)) {
            return { _id: new ObjectId(identifierValue) };
        }

        if (typeof identifierValue === 'object') {
            throw badRequest(
                `Invalid ObjectId: "${util.inspect(identifierValue)}" when trying to refer to a ${
                    metadata.title
                }`
            );
        } else if (typeof identifierValue === 'string') {
            const identifierQuery = {};
            identifierQuery[stringIdentifier.name] = identifierValue;
            return identifierQuery;
        } else {
            throw badRequest(
                `Invalid type of identifier "${typeof identifierValue}", value: "${util.inspect(
                    identifierValue
                )}" when trying to refer to a ${metadata.title}, must be a string or ObjectId`
            );
        }
    };
}
