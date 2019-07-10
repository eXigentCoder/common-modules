'use strict';

const { createOutputMapper } = require(`../../validation`);
const { createVersionInfoSetter } = require(`../../version-info`);
const get = require(`lodash/get`);
const set = require(`lodash/set`);
const { EntityNotFoundError } = require(`../../common-errors`);
const createMongoDbAuditors = require(`../auditors/create-mongodb-auditors`);
const ObjectId = require(`mongodb`).ObjectId;
const { runStepWithHooks } = require(`./steps`);
const {
    titleToStringIdentifier: defaultTitleToStringIdentifier,
    createAddTenantToFilter,
    createGetIdentifierQuery,
    createSetOwnerIfApplicable,
    createSetTenant,
    createStringIdentifierSetter,
    ensureEntityIsObject,
    checkAuthorization,
    checkAuthorizationOrAddOwnerToFilter,
} = require(`./utilities`);
const { auth, mapOutput, getFilter, setEntityFromInput } = require(`./steps`);
/**
 * @typedef {import('../../entity-metadata').EntityMetadata} EntityMetadata
 * @typedef {import('../types').CreateUtilityParams} CreateUtilityParams
 * @typedef {import('../types').Utilities} Utilities
 * @typedef {import('../types').Crud<Object>} Crud
 * @typedef {Crud & {utilities:Utilities}} GetCrud
 */

/** @type {import('../types').GetUtils} */
async function getUtils({
    metadata,
    inputValidator,
    outputValidator,
    db,
    auditors,
    enforcer,
    titleToStringIdentifier,
    paginationDefaults = {
        itemsPerPage: 20,
        sort: {},
        projection: {},
    },
}) {
    if (enforcer) {
        if (metadata.authorization.groups) {
            for (const group of metadata.authorization.groups) {
                await enforcer.addGroupingPolicy(...group);
            }
        }
        if (metadata.authorization.policies) {
            for (const policy of metadata.authorization.policies) {
                await enforcer.addPolicy(...policy);
            }
        }
    }
    titleToStringIdentifier = titleToStringIdentifier || defaultTitleToStringIdentifier;
    return {
        db,
        metadata,
        inputValidator,
        outputValidator,
        paginationDefaults,
        setVersionInfo: createVersionInfoSetter({ metadata, validator: inputValidator }),
        collection: db.collection(metadata.collectionName),
        mapOutput: createOutputMapper(metadata.schemas.output.$id, outputValidator),
        setStringIdentifier: createStringIdentifierSetter(metadata, titleToStringIdentifier),
        getIdentifierQuery: createGetIdentifierQuery(metadata),
        auditors: auditors || (await createMongoDbAuditors(metadata, db)),
        setTenant: createSetTenant(metadata),
        addTenantToFilter: createAddTenantToFilter(metadata),
        setOwnerIfApplicable: createSetOwnerIfApplicable(metadata),
        enforcer,
        titleToStringIdentifier,
    };
}

/**
 * @param {CreateUtilityParams} createUtilityParams The input utilities to create the function
 * @returns {Promise<GetCrud>} A promise which resolves to the CRUD methods
 */
async function getCrud({ metadata, inputValidator, outputValidator, db, enforcer }) {
    const utilities = await getUtils({
        metadata,
        inputValidator,
        outputValidator,
        db,
        enforcer,
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
 * @returns {import("../types").Create<object>} A function to create entities
 */
function getCreate(utilities) {
    const {
        setVersionInfo,
        collection,
        metadata,
        setStringIdentifier,
        inputValidator,
        auditors,
        setTenant,
        setOwnerIfApplicable,
    } = utilities;
    return async function create(_entity, executionContext, hooks) {
        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            input: _entity,
            utilities,
            hooks,
        };
        await runStepWithHooks(setEntityFromInput, hookContext);
        await runStepWithHooks(validate, hookContext);
        await runStepWithHooks(setMetadata, hookContext);
        await runStepWithHooks(auth(`create`), hookContext);
        await runStepWithHooks(async function insert(ctx) {
            await collection.insertOne(ctx.entity);
        }, hookContext);
        await runStepWithHooks(async function _audit(ctx) {
            await auditors.writeCreation(ctx.entity, executionContext);
        }, hookContext);
        await runStepWithHooks(mapOutput, hookContext);
        return hookContext.entity;
    };

    /** @param {import('../types').HookContext} hookContext */
    function validate(hookContext) {
        const { input } = hookContext;
        ensureEntityIsObject(input, metadata);
        hookContext.entity = JSON.parse(JSON.stringify(input));
        inputValidator.ensureValid(metadata.schemas.create.$id, hookContext.entity);
    }

    /** @param {import('../types').HookContext} hookContext */
    function setMetadata({ entity, executionContext }) {
        setStringIdentifier(entity);
        setTenant(entity, executionContext);
        setVersionInfo(entity, executionContext);
        setOwnerIfApplicable(entity, executionContext);
        entity._id = new ObjectId();
        inputValidator.ensureValid(metadata.schemas.core.$id, entity);
        entity._id = new ObjectId(entity._id);
    }
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").GetById<object>} A function to get entities by their identifiers
 */
function getGetById(utilities) {
    const { collection, metadata } = utilities;
    return async function getById(id, executionContext, hooks) {
        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            id,
            utilities,
            hooks,
        };
        await runStepWithHooks(getFilter, hookContext);
        await runStepWithHooks(async function _findOne(ctx) {
            ctx.entity = await collection.findOne(ctx.filter);
            if (!ctx.entity) {
                throw new EntityNotFoundError(metadata.title, id);
            }
        }, hookContext);
        await runStepWithHooks(auth(`retrieve`), hookContext);
        await runStepWithHooks(mapOutput, hookContext);
        return hookContext.entity;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").DeleteById<object>} A function to delete entities by their identifier
 */
function getDeleteById(utilities) {
    const { collection, metadata, auditors } = utilities;
    return async function deleteById(id, executionContext, hooks) {
        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            id,
            utilities,
            hooks,
        };
        await runStepWithHooks(getFilter, hookContext);
        await runStepWithHooks(async function _find(ctx) {
            ctx.entity = await collection.findOne(ctx.filter);
            if (!ctx.entity) {
                throw new EntityNotFoundError(metadata.title, id);
            }
        }, hookContext);
        await runStepWithHooks(auth(`delete`), hookContext);
        await runStepWithHooks(async function _delete(ctx) {
            ctx.result = await collection.findOneAndDelete(ctx.filter);
            if (!ctx.result.value) {
                throw new EntityNotFoundError(metadata.title, id);
            }
        }, hookContext);
        await runStepWithHooks(async function _audit(ctx) {
            await auditors.writeDeletion(ctx.result.value, executionContext);
        }, hookContext);
    };
}
/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").ReplaceById<object>} A function to replace documents based off of their _id
 */
function getReplaceById(utilities) {
    const {
        setVersionInfo,
        collection,
        metadata,
        inputValidator,
        auditors,
        getIdentifierQuery,
        addTenantToFilter,
        setStringIdentifier,
        enforcer,
    } = utilities;
    return async function replaceById(id, _entity, executionContext, hooks) {
        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            input: _entity,
            id,
            utilities,
            hooks,
        };
        await runStepWithHooks(sanitize, hookContext);
        await runStepWithHooks(async function _filter(ctx) {
            ctx.filter = getIdentifierQuery(id);
            addTenantToFilter(ctx.filter, executionContext);
        }, hookContext);
        await runStepWithHooks(async function _findExisting(ctx) {
            ctx.existing = await collection.findOne(ctx.filter);
            if (!ctx.existing) {
                throw new EntityNotFoundError(metadata.title, JSON.stringify(ctx.filter));
            }
        }, hookContext);
        await runStepWithHooks(async function _auth(ctx) {
            await checkAuthorization(enforcer, metadata, executionContext, `update`, ctx.existing);
        }, hookContext);

        await runStepWithHooks(async function _checkSetTenant(ctx) {
            if (metadata.tenantInfo) {
                const existingTenantId = get(ctx.existing, metadata.tenantInfo.entityPathToId);
                if (!existingTenantId) {
                    throw new Error(
                        `existingTenantId was null at path "${
                            metadata.tenantInfo.entityPathToId
                        }" for ${metadata.title} with id ${ctx.id}`
                    );
                }
                set(ctx.entity, metadata.tenantInfo.entityPathToId, existingTenantId);
            }
        }, hookContext);
        await runStepWithHooks(async function _validate(ctx) {
            inputValidator.ensureValid(metadata.schemas.replace.$id, ctx.entity);
        }, hookContext);
        await runStepWithHooks(async function _setData(ctx) {
            ctx.entity.versionInfo = ctx.existing.versionInfo;
            if (ctx.existing.owner) {
                ctx.entity.owner = ctx.existing.owner;
            }
            setVersionInfo(ctx.entity, executionContext);
            setStringIdentifier(ctx.entity);
        }, hookContext);
        await runStepWithHooks(async function _validateCore(ctx) {
            inputValidator.ensureValid(metadata.schemas.core.$id, ctx.entity);
        }, hookContext);
        await runStepWithHooks(async function _replace(ctx) {
            ctx.result = await collection.findOneAndReplace(ctx.filter, ctx.entity);
            ctx.entity._id = ctx.result.value._id;
        }, hookContext);
        await runStepWithHooks(async function _audit(ctx) {
            await auditors.writeReplacement(ctx.entity, executionContext);
        }, hookContext);

        await runStepWithHooks(mapOutput, hookContext);
        return hookContext.entity;
    };

    /** @param {import('../types').HookContext} hookContext */
    function sanitize(hookContext) {
        const { input } = hookContext;
        ensureEntityIsObject(input, metadata);
        hookContext.entity = JSON.parse(JSON.stringify(input));
        // comes from outside, can't be trusted
        delete hookContext.entity.versionInfo;
        delete hookContext.entity._id;
        delete hookContext.entity.owner;
    }
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").Search<object>} A function to search for entities
 */
function getSearch(utilities) {
    const { collection, paginationDefaults, addTenantToFilter, metadata, enforcer } = utilities;
    return async function search(query, executionContext, hooks) {
        /** @type {import('../types').Query} */
        let queryObj = {};
        // @ts-ignore
        if (query.filter === null || query.filter === undefined) {
            queryObj.filter = query;
        } else {
            // @ts-ignore
            queryObj = query;
        }
        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            utilities,
            query: queryObj,
            hooks,
        };
        await runStepWithHooks(async function _addTenant(ctx) {
            addTenantToFilter(ctx.query.filter, executionContext);
        }, hookContext);
        await runStepWithHooks(async function _auth(ctx) {
            await checkAuthorizationOrAddOwnerToFilter(
                ctx.query.filter,
                enforcer,
                metadata,
                executionContext,
                `retrieve`
            );
        }, hookContext);
        await runStepWithHooks(async function _search(ctx) {
            ctx.entity = await collection
                .find(queryObj.filter)
                .skip(queryObj.skip || 0)
                .limit(queryObj.limit || paginationDefaults.itemsPerPage)
                .sort(queryObj.sort || paginationDefaults.sort)
                .project(queryObj.projection || paginationDefaults.projection)
                .toArray();
        }, hookContext);
        await runStepWithHooks(mapOutput, hookContext);
        return hookContext.entity;
    };
}

module.exports = { getUtils, getCrud };
