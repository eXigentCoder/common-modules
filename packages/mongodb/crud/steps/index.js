'use strict';

const upperFirst = require(`lodash/upperFirst`);
const {
    checkAuthorization,
    ensureEntityIsObject,
    checkAuthorizationOrAddOwnerToFilter,
} = require(`../utilities`);
const { EntityNotFoundError } = require(`../../../common-errors`);

/**
 * @param {import('../../types').Hook} stepFn
 * @param {import('../../types').HookContext} hookContext
 */
async function runStepWithHooks(stepFn, hookContext) {
    const stepName = stepFn.name;
    if (!stepName || stepName === `anonomous`) {
        throw new Error(`Steps must have names, use a named function`);
    }
    const upperStepName = upperFirst(stepName);
    const hooks = hookContext.hooks || {};
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
 * @param {import('../../types').Hook} fn
 * @param {import('../../types').HookContext} hookContext
 * @returns {Promise<void>}
 */
async function runHook(fn, hookContext) {
    if (!fn) {
        return;
    }
    await fn(hookContext);
}

/** @type {import('../../types').Hook} */
async function setEntityFromInput(hookContext) {
    const { input, utilities } = hookContext;
    ensureEntityIsObject(input, utilities.metadata);
    hookContext.entity = JSON.parse(JSON.stringify(input));
}

/**
 * @param {string} action
 * @returns {import('../../types').Hook}
 */
function getAuthorizeFn(action) {
    return async function authorize(hookContext) {
        await checkAuthorization(
            hookContext.utilities.enforcer,
            hookContext.utilities.metadata,
            hookContext.executionContext,
            action,
            hookContext.entity
        );
    };
}

/** @type {import('../../types').Hook} */
async function mapEntityForOutput(hookContext) {
    hookContext.utilities.mapOutput(hookContext.entity);
}

/** @type {import('../../types').Hook} */
function setFilterFromId(hookContext) {
    hookContext.filter = hookContext.utilities.getIdentifierQuery(hookContext.id);
    hookContext.utilities.addTenantToFilter(hookContext.filter, hookContext.executionContext);
}

/**
 * @param {string} schemaName
 * @returns {import('../../types').Hook}
 */
function getValidateEntityFn(schemaName) {
    return async function _validate(hookContext) {
        const schemaId = hookContext.utilities.metadata.schemas[schemaName].$id;
        hookContext.utilities.inputValidator.ensureValid(schemaId, hookContext.entity);
    };
}

/**
 * @param {string} action
 * @returns {import('../../types').Hook}
 */
function getWriteAuditEntryFn(action) {
    return async function writeAuditEntry(hookContext) {
        const { entity, utilities, executionContext } = hookContext;
        await utilities.auditors.writeAuditEntry(entity, executionContext, action);
    };
}

/** @type {import('../../types').Hook} */
async function setEntityFromDbUsingFilter(hookContext) {
    hookContext.entity = await hookContext.utilities.collection.findOne(hookContext.filter);
    if (!hookContext.entity) {
        throw new EntityNotFoundError(hookContext.utilities.metadata.title, hookContext.id);
    }
}

/** @type {import('../../types').Hook} */
async function authorizeQuery(hookContext) {
    const { utilities, query, executionContext } = hookContext;
    utilities.addTenantToFilter(query.filter, executionContext);
    await checkAuthorizationOrAddOwnerToFilter(
        query.filter,
        utilities.enforcer,
        utilities.metadata,
        executionContext,
        `retrieve`
    );
}

/** @type {import('../../types').Hook} */
function moveCurrentEntityToExisting(hookContext) {
    hookContext.existing = hookContext.entity;
    delete hookContext.entity;
}

/** @type {import('../../types').Hook} */
async function insertEntityIntoDb(hookContext) {
    const { utilities, entity } = hookContext;
    const { collection } = utilities;
    await collection.insertOne(entity);
}

/** @type {import('../../types').Hook} */
async function deleteFromDbUsingFilter(hookContext) {
    const { utilities, id, filter } = hookContext;
    const { collection } = utilities;
    const result = await collection.findOneAndDelete(filter);
    if (!result.value) {
        throw new EntityNotFoundError(utilities.metadata.title, id);
    }
    hookContext.entity = result.value;
}

/** @type {import('../../types').Hook} */
async function replace(hookContext) {
    const { utilities, entity, filter } = hookContext;
    const { collection } = utilities;
    hookContext.result = await collection.findOneAndReplace(filter, entity);
    hookContext.entity._id = hookContext.result.value._id;
}

/** @type {import('../../types').Hook} */
async function setEntityFromDBUsingQuery(hookContext) {
    const { utilities, query } = hookContext;
    const { collection, paginationDefaults } = utilities;
    hookContext.entity = await collection
        .find(query.filter)
        .skip(query.skip || 0)
        .limit(query.limit || paginationDefaults.itemsPerPage)
        .sort(query.sort || paginationDefaults.sort)
        .project(query.projection || paginationDefaults.projection)
        .toArray();
}

/** @type {import('../../types').Hook} */
async function setMetadataFields({ existing, entity, executionContext, utilities }) {
    utilities.setStringIdentifier(entity);
    utilities.setTenant(entity, executionContext);
    if (existing) {
        entity.versionInfo = existing.versionInfo;
        if (existing.owner) {
            entity.owner = existing.owner;
        }
    } else {
        utilities.setOwnerIfApplicable(entity, executionContext);
    }
    utilities.setVersionInfo(entity, executionContext);
    delete entity._id;
}

module.exports = {
    runStepWithHooks,
    getAuthorizeFn,
    mapEntityForOutput,
    setFilterFromId,
    setEntityFromInput,
    getValidateEntityFn,
    getWriteAuditEntryFn,
    setEntityFromDbUsingFilter,
    authorizeQuery,
    insertEntityIntoDb,
    deleteFromDbUsingFilter,
    replace,
    moveCurrentEntityToExisting,
    setEntityFromDBUsingQuery,
    setMetadataFields,
};
