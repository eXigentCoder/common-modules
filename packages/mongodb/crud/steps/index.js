'use strict';

const upperFirst = require(`lodash/upperFirst`);
const { checkAuthorization, ensureEntityIsObject } = require(`../utilities`);
const { EntityNotFoundError } = require(`../../../common-errors`);

/**
 * @param {Function} stepFn
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
 * @param {Function} fn
 * @param {import('../../types').HookContext} hookContext
 * @returns {Promise<void>}
 */
async function runHook(fn, hookContext) {
    if (!fn) {
        return;
    }
    await fn(hookContext);
}

/** @param {import('../../types').HookContext} hookContext */
function setEntityFromInput(hookContext) {
    const { input, utilities } = hookContext;
    ensureEntityIsObject(input, utilities.metadata);
    hookContext.entity = JSON.parse(JSON.stringify(input));
}

/**
 * @param {string} action
 * @returns {Function}
 */
function auth(action) {
    /** @param {import('../../types').HookContext} hookContext */
    return async function _auth(hookContext) {
        await checkAuthorization(
            hookContext.utilities.enforcer,
            hookContext.utilities.metadata,
            hookContext.executionContext,
            action,
            hookContext.entity
        );
    };
}

/** @param {import('../../types').HookContext} hookContext */
async function mapOutput(hookContext) {
    hookContext.utilities.mapOutput(hookContext.entity);
}

/** @param {import('../../types').HookContext} hookContext */
function getFilterFromId(hookContext) {
    hookContext.filter = hookContext.utilities.getIdentifierQuery(hookContext.id);
    hookContext.utilities.addTenantToFilter(hookContext.filter, hookContext.executionContext);
}

/**
 * @param {string} schemaName
 * @returns {Function}
 */
function validate(schemaName) {
    /** @param {import('../../types').HookContext} hookContext */
    function _validate(hookContext) {
        const schemaId = hookContext.utilities.metadata.schemas[schemaName].$id;
        hookContext.utilities.inputValidator.ensureValid(schemaId, hookContext.entity);
    }
    return _validate;
}

/**
 * @param {string} action
 * @returns {Function}
 */
function writeAudit(action) {
    /** @param {import('../../types').HookContext} hookContext */
    async function _writeAudit(hookContext) {
        const { entity, utilities, executionContext } = hookContext;
        await utilities.auditors.writeAuditEntry(entity, executionContext, action);
    }
    return _writeAudit;
}

/** @param {import('../../types').HookContext} hookContext */
async function setEntityFromFilter(hookContext) {
    hookContext.entity = await hookContext.utilities.collection.findOne(hookContext.filter);
    if (!hookContext.entity) {
        throw new EntityNotFoundError(hookContext.utilities.metadata.title, hookContext.id);
    }
}

module.exports = {
    runStepWithHooks,
    auth,
    mapOutput,
    getFilterFromId,
    setEntityFromInput,
    validate,
    writeAudit,
    setEntityFromFilter,
};
