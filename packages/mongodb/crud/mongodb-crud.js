'use strict';

const { ValidationError, TenantError, NotAuthorizedError } = require(`../../common-errors`);
const { createOutputMapper } = require(`../../validation`);
const { createVersionInfoSetter } = require(`../../version-info`);
const get = require(`lodash/get`);
const set = require(`lodash/set`);
const upperFirst = require(`lodash/upperFirst`);
const { EntityNotFoundError } = require(`../../common-errors`);
const createGetIdentifierQuery = require(`./utilities/create-identifier-query`);
const createMongoDbAuditors = require(`../auditors/create-mongodb-auditors`);
const ObjectId = require(`mongodb`).ObjectId;
const createSetOwnerIfApplicable = require(`./utilities/set-owner-if-applicable`);
const defaultTitleToStringIdentifier = require(`./utilities/title-to-string-identifier`);
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
        mapOutput,
        metadata,
        setStringIdentifier,
        inputValidator,
        auditors,
        setTenant,
        enforcer,
        setOwnerIfApplicable,
    } = utilities;
    return async function create(_entity, executionContext, hooks) {
        const hookContext = {
            executionContext,
            input: _entity,
            utilities,
            entity: null,
        };
        await runStepWithHooks(`validate`, validate, hooks, hookContext);
        await runStepWithHooks(`setMetadata`, setMetadata, hooks, hookContext);
        await runStepWithHooks(
            `authorize`,
            async ctx => {
                await checkAuthorization(
                    enforcer,
                    metadata,
                    executionContext,
                    `create`,
                    ctx.entity
                );
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `insert`,
            async ctx => {
                await collection.insertOne(ctx.entity);
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `writeAudit`,
            async ctx => {
                await auditors.writeCreation(ctx.entity, executionContext);
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `mapOutput`,
            async ctx => {
                mapOutput(ctx.entity);
            },
            hooks,
            hookContext
        );

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
    const {
        collection,
        mapOutput,
        getIdentifierQuery,
        metadata,
        addTenantToFilter,
        enforcer,
    } = utilities;
    return async function getById(id, executionContext, hooks) {
        const hookContext = {
            executionContext,
            id,
            utilities,
            filter: null,
            item: null,
        };
        await runStepWithHooks(
            `getFilter`,
            async ctx => {
                ctx.filter = getIdentifierQuery(id);
                addTenantToFilter(ctx.filter, executionContext);
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `getItem`,
            async ctx => {
                ctx.item = await collection.findOne(ctx.filter);
                if (!ctx.item) {
                    throw new EntityNotFoundError(metadata.title, id);
                }
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `authorize`,
            async ctx => {
                await checkAuthorization(
                    enforcer,
                    metadata,
                    executionContext,
                    `retrieve`,
                    ctx.item
                );
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `mapOutput`,
            async ctx => {
                mapOutput(ctx.item);
            },
            hooks,
            hookContext
        );
        return hookContext.item;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").DeleteById<object>} A function to delete entities by their identifier
 */
function getDeleteById(utilities) {
    const {
        collection,
        getIdentifierQuery,
        metadata,
        auditors,
        addTenantToFilter,
        enforcer,
    } = utilities;
    return async function deleteById(id, executionContext) {
        const filter = getIdentifierQuery(id);
        addTenantToFilter(filter, executionContext);
        const existingItem = await collection.findOne(filter);
        if (!existingItem) {
            throw new EntityNotFoundError(metadata.title, id);
        }
        await checkAuthorization(enforcer, metadata, executionContext, `delete`, existingItem);
        const result = await collection.findOneAndDelete(filter);
        if (!result.value) {
            throw new EntityNotFoundError(metadata.title, id);
        }
        await auditors.writeDeletion(result.value, executionContext);
        return;
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
        mapOutput,
        metadata,
        inputValidator,
        auditors,
        getIdentifierQuery,
        addTenantToFilter,
        setStringIdentifier,
        enforcer,
    } = utilities;
    return async function replaceById(id, _entity, executionContext) {
        ensureEntityIsObject(_entity, metadata);
        const entity = JSON.parse(JSON.stringify(_entity));
        // comes from outside, can't be trusted
        delete entity.versionInfo;
        delete entity._id;
        delete entity.owner;
        const filter = getIdentifierQuery(id);
        if (metadata.tenantInfo) {
            addTenantToFilter(filter, executionContext);
        }
        const existing = await collection.findOne(filter);
        if (!existing) {
            throw new EntityNotFoundError(metadata.title, JSON.stringify(filter));
        }
        await checkAuthorization(enforcer, metadata, executionContext, `update`, existing);
        if (metadata.tenantInfo) {
            const existingTenantId = get(existing, metadata.tenantInfo.entityPathToId);
            if (!existingTenantId) {
                throw new Error(
                    `existingTenantId was null at path "${
                        metadata.tenantInfo.entityPathToId
                    }" for ${metadata.title} with id ${entity._id}`
                );
            }
            set(entity, metadata.tenantInfo.entityPathToId, existingTenantId);
        }
        inputValidator.ensureValid(metadata.schemas.replace.$id, entity);
        entity.versionInfo = existing.versionInfo;
        if (existing.owner) {
            entity.owner = existing.owner;
        }
        setVersionInfo(entity, executionContext);
        setStringIdentifier(entity);
        inputValidator.ensureValid(metadata.schemas.core.$id, entity);
        const replaceResult = await collection.findOneAndReplace(filter, entity);
        entity._id = replaceResult.value._id;
        await auditors.writeReplacement(replaceResult.value, entity, executionContext);
        mapOutput(entity);
        return entity;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").Search<object>} A function to search for entities
 */
function getSearch(utilities) {
    const {
        collection,
        mapOutput,
        paginationDefaults,
        addTenantToFilter,
        metadata,
        enforcer,
    } = utilities;
    return async function search(query, executionContext) {
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
        addTenantToFilter(filter, executionContext);
        await checkAuthorizationOrAddOwnerToFilter(
            filter,
            enforcer,
            metadata,
            executionContext,
            `retrieve`
        );
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

// --------------============== [ Todo these utilities should probably all be their own files]

/**
 * @param {import('casbin').Enforcer} [enforcer] The Casbin enforcer to use with the policies if provided
 * @param {EntityMetadata} metadata The entities metadata object
 * @param {import('../../version-info/types').ExecutionContext} executionContext The execution context for this action
 * @param {string} action the name of the action
 * @param {any} currentEntity The current entity to check ownership against
 * @returns {Promise<void>}
 */
async function checkAuthorization(enforcer, metadata, executionContext, action, currentEntity) {
    if (!metadata.authorization) {
        return;
    }
    const currentUserId = executionContext.identity.id;
    let aclAllowed = false;
    let ownershipAllowed = false;
    let allowed = false;
    if (enforcer) {
        aclAllowed = await enforcer.enforce(currentUserId, metadata.namePlural, action);
    }
    if (metadata.authorization.ownership) {
        let actionAllowed =
            metadata.authorization.ownership.allowedActions.indexOf(action) >= 0 ||
            metadata.authorization.ownership.allowedActions.indexOf(`*`) >= 0;
        let isOwner = get(currentEntity, `owner.id`, ``) === currentUserId;
        ownershipAllowed = actionAllowed && isOwner;
    }
    if (metadata.authorization.interaction === `or`) {
        allowed = aclAllowed || ownershipAllowed;
    } else {
        allowed = aclAllowed && ownershipAllowed;
    }
    if (!allowed) {
        throw new NotAuthorizedError(executionContext.identity.id, metadata.namePlural, action);
    }
}

async function checkAuthorizationOrAddOwnerToFilter(
    filter,
    enforcer,
    metadata,
    executionContext,
    action
) {
    if (!metadata.authorization) {
        return;
    }
    const currentUserId = executionContext.identity.id;
    if (enforcer) {
        let aclAllowed = await enforcer.enforce(currentUserId, metadata.namePlural, action);
        if (aclAllowed) {
            return;
        }
    }
    if (!metadata.authorization.ownership) {
        throw new NotAuthorizedError(executionContext.identity.id, metadata.namePlural, action);
    }
    let actionAllowed =
        metadata.authorization.ownership.allowedActions.indexOf(action) >= 0 ||
        metadata.authorization.ownership.allowedActions.indexOf(`*`) >= 0;
    if (!actionAllowed) {
        throw new NotAuthorizedError(executionContext.identity.id, metadata.namePlural, action);
    }
    filter[`owner.id`] = currentUserId;
}

/**
 * @param {EntityMetadata} metadata The entity metadata containing the rules for the string identifier
 * @returns {import('../types').SetStringIdentifier} The function to set the string identifier on an object
 */
function createStringIdentifierSetter(metadata, titleToStringIdentifier) {
    return function setStringIdentifier(item) {
        if (!metadata.stringIdentifier) {
            return;
        }
        if (metadata.stringIdentifier.entitySourcePath) {
            const currentValue = get(item, metadata.stringIdentifier.pathToId);
            if (currentValue) {
                return;
            }
            const newValue = titleToStringIdentifier(
                get(item, metadata.stringIdentifier.entitySourcePath)
            );
            set(item, metadata.stringIdentifier.pathToId, newValue);
        }
    };
}

function ensureEntityIsObject(entity, metadata) {
    if (entity === null || typeof entity !== `object`) {
        throw new ValidationError(
            `The ${metadata.title} value provided was not an object, type was :${typeof entity}`
        );
    }
}

/** @type {import('../types').CreateSetTenant} */
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

/** @type {import('../types').CreateAddTenantToFilter} */
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

/**
 * @param {Function} stepFn
 * @param {{[key: string]: Function }} hooks
 * @param {string} stepName
 * @param {import('../types').HookContext} hookContext
 */
async function runStepWithHooks(stepName, stepFn, hooks = {}, hookContext) {
    const upperStepName = upperFirst(stepName);
    const beforeFn = hooks[`before${upperStepName}`];
    if (beforeFn) {
        await runHook(beforeFn, hookContext);
    }
    const replaceFn = hooks[stepName];
    if (replaceFn) {
        await runHook(replaceFn, hookContext);
    } else {
        await stepFn(hookContext);
    }
    const afterFn = hooks[`after${upperStepName}`];
    if (afterFn) {
        await runHook(afterFn, hookContext);
    }
}

/**
 * @param {Function} fn
 * @param {import('../types').HookContext} hookContext
 * @returns {Promise<void>}
 */
async function runHook(fn, hookContext) {
    if (!fn) {
        return;
    }
    await fn(hookContext);
}
