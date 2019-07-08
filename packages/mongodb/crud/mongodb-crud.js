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
            entity: null,
        };
        await runStepWithHooks(`validate`, validate, hooks, hookContext);
        await runStepWithHooks(`setMetadata`, setMetadata, hooks, hookContext);
        await runStepWithHooks(`authorize`, auth(`create`), hooks, hookContext);
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
        await runStepWithHooks(`mapOutput`, mapOutput, hooks, hookContext);
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
        };
        await runStepWithHooks(`getFilter`, getFilter, hooks, hookContext);
        await runStepWithHooks(
            `getItem`,
            async ctx => {
                ctx.entity = await collection.findOne(ctx.filter);
                if (!ctx.entity) {
                    throw new EntityNotFoundError(metadata.title, id);
                }
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(`authorize`, auth(`retrieve`), hooks, hookContext);
        await runStepWithHooks(`mapOutput`, mapOutput, hooks, hookContext);
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
        };
        await runStepWithHooks(`getFilter`, getFilter, hooks, hookContext);
        await runStepWithHooks(
            `getItem`,
            async ctx => {
                ctx.entity = await collection.findOne(ctx.filter);
                if (!ctx.entity) {
                    throw new EntityNotFoundError(metadata.title, id);
                }
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(`authorize`, auth(`delete`), hooks, hookContext);
        await runStepWithHooks(
            `delete`,
            async ctx => {
                ctx.result = await collection.findOneAndDelete(ctx.filter);
                if (!ctx.result.value) {
                    throw new EntityNotFoundError(metadata.title, id);
                }
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `writeAudit`,
            async ctx => {
                await auditors.writeDeletion(ctx.result.value, executionContext);
            },
            hooks,
            hookContext
        );
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
        };
        await runStepWithHooks(`sanitize`, sanitize, hooks, hookContext);
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
            `getExistingItem`,
            async ctx => {
                ctx.existing = await collection.findOne(ctx.filter);
                if (!ctx.existing) {
                    throw new EntityNotFoundError(metadata.title, JSON.stringify(ctx.filter));
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
                    `update`,
                    ctx.existing
                );
            },
            hooks,
            hookContext
        );

        await runStepWithHooks(
            `checkAndSetTenantInfo`,
            async ctx => {
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
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `validate`,
            async ctx => {
                inputValidator.ensureValid(metadata.schemas.replace.$id, ctx.entity);
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `copySystemProps`,
            async ctx => {
                ctx.entity.versionInfo = ctx.existing.versionInfo;
                if (ctx.existing.owner) {
                    ctx.entity.owner = ctx.existing.owner;
                }
                setVersionInfo(ctx.entity, executionContext);
                setStringIdentifier(ctx.entity);
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `validateCore`,
            async ctx => {
                inputValidator.ensureValid(metadata.schemas.core.$id, ctx.entity);
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `replace`,
            async ctx => {
                ctx.result = await collection.findOneAndReplace(ctx.filter, ctx.entity);
                ctx.entity._id = ctx.result.value._id;
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `writeAudit`,
            async ctx => {
                await auditors.writeReplacement(ctx.result.value, ctx.entity, executionContext);
            },
            hooks,
            hookContext
        );

        await runStepWithHooks(`mapOutput`, mapOutput, hooks, hookContext);
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
        };
        await runStepWithHooks(
            `getFilter`,
            async ctx => {
                addTenantToFilter(ctx.query.filter, executionContext);
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `authorize`,
            async ctx => {
                await checkAuthorizationOrAddOwnerToFilter(
                    ctx.query.filter,
                    enforcer,
                    metadata,
                    executionContext,
                    `retrieve`
                );
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(
            `search`,
            async ctx => {
                ctx.entity = await collection
                    .find(queryObj.filter)
                    .skip(queryObj.skip || 0)
                    .limit(queryObj.limit || paginationDefaults.itemsPerPage)
                    .sort(queryObj.sort || paginationDefaults.sort)
                    .project(queryObj.projection || paginationDefaults.projection)
                    .toArray();
            },
            hooks,
            hookContext
        );
        await runStepWithHooks(`mapOutput`, mapOutput, hooks, hookContext);
        return hookContext.entity;
    };
}

module.exports = { getUtils, getCrud };

// --------------============== [ Todo shared steps]

/**
 * @param {string} action
 * @returns {Function}
 */
function auth(action) {
    /** @param {import('../types').HookContext} hookContext */
    return async hookContext => {
        await checkAuthorization(
            hookContext.utilities.enforcer,
            hookContext.utilities.metadata,
            hookContext.executionContext,
            action,
            hookContext.entity
        );
    };
}

/** @param {import('../types').HookContext} hookContext */
async function mapOutput(hookContext) {
    hookContext.utilities.mapOutput(hookContext.entity);
}

/** @param {import('../types').HookContext} hookContext */
function getFilter(hookContext) {
    hookContext.filter = hookContext.utilities.getIdentifierQuery(hookContext.id);
    hookContext.utilities.addTenantToFilter(hookContext.filter, hookContext.executionContext);
}

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
