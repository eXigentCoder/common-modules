'use strict';

const { ValidationError } = require('../common-errors');
const { createOutputMapper } = require('../validation');
const { createVersionInfoSetter } = require('../version-info');
const get = require('lodash/get');
const { EntityNotFoundError } = require('../common-errors');
const createGetIdentifierQuery = require('./create-identifier-query');
const createMongoDbAuditors = require('./create-mongodb-auditors');
const ObjectId = require('mongodb').ObjectId;

/**
 * @typedef {import('../entity-metadata').EntityMetadata} EntityMetadata
 * @typedef {import('./types').CreateUtilityParams} CreateUtilityParams
 * @typedef {import('./types').Utilities} Utilities
 * @typedef {import('./types').Crud<Object>} Crud
 * @typedef {Crud & {utilities:Utilities}} GetCrud
 */

/** @type {import('./types').GetUtils} */
async function getUtils({
    metadata,
    inputValidator,
    outputValidator,
    db,
    auditors,
    paginationDefaults = {
        itemsPerPage: 20,
        sort: {},
        projection: {},
    },
}) {
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
        paginationDefaults,
    };
}

/**
 * @param {CreateUtilityParams} createUtilityParams The input utilities to create the function
 * @returns {Promise<GetCrud>} A promise which resolves to the CRUD methods
 */
async function getCrud({ metadata, inputValidator, outputValidator, db }) {
    const utilities = await getUtils({
        metadata,
        inputValidator,
        outputValidator,
        db,
    });
    return {
        create: getCreate(utilities),
        getById: getGetById(utilities),
        deleteById: getDeleteById(utilities),
        replaceById: getReplaceById(utilities),
        search: getSearch(utilities),
        utilities,
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("./types").Create<object>} A function to create entities
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
        ensureEntityIsObject(_entity, metadata);
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
 * @returns {import("./types").GetById<object>} A function to get entities by their identifiers
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
 * @returns {import("./types").DeleteById<object>} A function to delete entities by their identifier
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
 * @returns {import("./types").ReplaceById<object>} A function to replace documents based off of their _id
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
        ensureEntityIsObject(_entity, metadata);
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
 * @returns {import("./types").Search<object>} A function to search for entities
 */
function getSearch({ collection, mapOutput, paginationDefaults }) {
    return async function search(query) {
        // @ts-ignore
        let { filter, skip, limit, sort, projection } = query;
        // @ts-ignore
        if (query.filter === null || query.filter === undefined) {
            filter = query;
            skip = undefined;
            limit = undefined;
            sort = undefined;
            projection = undefined;
        }
        const items = await collection
            .find(filter)
            .skip(skip || 0)
            .limit(limit || paginationDefaults.itemsPerPage)
            .sort(sort || paginationDefaults.sort)
            .project(projection || paginationDefaults.projection)
            .toArray();
        mapOutput(items);
        return items;
    };
}

module.exports = { getUtils, getCrud };

/**
 * @param {EntityMetadata} metadata The entity metadata containing the rules for the string identifier
 * @returns {import('./types').SetStringIdentifier} The function to set the string identifier on an object
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

function ensureEntityIsObject(entity, metadata) {
    if (entity === null || typeof entity !== 'object') {
        throw new ValidationError(
            `The ${metadata.title} value provided was not an object, type was :${typeof entity}`
        );
    }
}
