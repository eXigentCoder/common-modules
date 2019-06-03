'use strict';

const { ValidationError, TenantError } = require('../common-errors');
const { createOutputMapper } = require('../validation');
const { createVersionInfoSetter } = require('../version-info');
const get = require('lodash/get');
const set = require('lodash/set');
const { EntityNotFoundError } = require('../common-errors');
const createGetIdentifierQuery = require('./create-identifier-query');
const createMongoDbAuditors = require('./create-mongodb-auditors');
const { removePropertyFromEntity } = require('../entity-metadata/json-schema-utilities');
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
    return {
        db,
        metadata,
        inputValidator,
        outputValidator,
        paginationDefaults,
        setVersionInfo: createVersionInfoSetter({ metadata, validator: inputValidator }),
        collection: db.collection(metadata.collectionName),
        mapOutput: createOutputMapper(metadata.schemas.output.$id, outputValidator),
        setStringIdentifier: createStringIdentifierSetter(metadata),
        getIdentifierQuery: createGetIdentifierQuery(metadata),
        auditors: auditors || (await createMongoDbAuditors(metadata, db)),
        setTenant: createSetTenant(metadata),
        addTenantToFilter: createAddTenantToFilter(metadata),
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
    setTenant,
}) {
    return async function create(_entity, context) {
        ensureEntityIsObject(_entity, metadata);
        const entity = JSON.parse(JSON.stringify(_entity));
        inputValidator.ensureValid(metadata.schemas.create.$id, entity);
        setStringIdentifier(entity);
        setTenant(entity, context);
        setVersionInfo(entity, context);
        await collection.insertOne(entity);
        await auditors.writeCreation(entity, context);
        mapOutput(entity);
        return entity;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("./types").GetById<object>} A function to get entities by their identifiers
 */
function getGetById({ collection, mapOutput, getIdentifierQuery, metadata, addTenantToFilter }) {
    return async function getById(id, context) {
        const query = getIdentifierQuery(id);
        addTenantToFilter(query, context);
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
function getDeleteById({ collection, getIdentifierQuery, metadata, auditors, addTenantToFilter }) {
    return async function deleteById(id, context) {
        const query = getIdentifierQuery(id);
        addTenantToFilter(query, context);
        const result = await collection.findOneAndDelete(query);
        if (!result.value) {
            throw new EntityNotFoundError(metadata.title, id);
        }
        await auditors.writeDeletion(result.value, context);
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
    getIdentifierQuery,
    addTenantToFilter,
}) {
    return async function replaceById(id, _entity, context) {
        ensureEntityIsObject(_entity, metadata);
        const entity = JSON.parse(JSON.stringify(_entity));
        // comes from outside, can't be trusted
        delete entity.versionInfo;
        delete entity._id;
        const query = getIdentifierQuery(id);
        if (metadata.tenantInfo) {
            removePropertyFromEntity(entity, metadata.tenantInfo.entityPathToId);
            addTenantToFilter(query, context);
        }
        inputValidator.ensureValid(metadata.schemas.replace.$id, entity);
        const existing = await collection.findOne(query);
        if (!existing) {
            throw new EntityNotFoundError(metadata.title, JSON.stringify(query));
        }
        entity.versionInfo = existing.versionInfo;
        setVersionInfo(entity, context);
        const replaceResult = await collection.findOneAndReplace(query, entity);
        entity._id = replaceResult.value._id;
        await auditors.writeReplacement(replaceResult.value, entity, context);
        mapOutput(entity);
        return entity;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("./types").Search<object>} A function to search for entities
 */
function getSearch({ collection, mapOutput, paginationDefaults, addTenantToFilter }) {
    return async function search(query, context) {
        // @ts-ignore
        let { filter, skip, limit, sort, projection } = query;
        addTenantToFilter(filter, context);
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
        if (metadata.stringIdentifier.entitySourcePath) {
            const currentValue = get(item, metadata.stringIdentifier.pathToId);
            if (currentValue) {
                return;
            }
            const newValue = metadata.titleToStringIdentifier(
                get(item, metadata.stringIdentifier.entitySourcePath)
            );
            set(item, metadata.stringIdentifier.pathToId, newValue);
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

/** @type {import('./types').CreateSetTenant} */
function createSetTenant(metadata) {
    return function setTenant(entity, context) {
        if (!metadata.tenantInfo) {
            return;
        }
        const value = get(context, metadata.tenantInfo.executionContextSourcePath);
        if (!value) {
            throw new TenantError(metadata.tenantInfo.title);
        }
        set(entity, metadata.tenantInfo.entityPathToId, value);
    };
}

/** @type {import('./types').CreateAddTenantToFilter} */
function createAddTenantToFilter(metadata) {
    return function addTenantToFilter(query, context) {
        if (!metadata.tenantInfo) {
            return;
        }
        const value = get(context, metadata.tenantInfo.executionContextSourcePath);
        if (!value) {
            throw new TenantError(metadata.tenantInfo.title);
        }
        set(query, metadata.tenantInfo.entityPathToId, value);
    };
}
