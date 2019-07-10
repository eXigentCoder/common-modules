'use strict';

const upperFirst = require(`lodash/upperFirst`);
const { checkAuthorization, ensureEntityIsObject } = require(`../utilities`);
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
function getFilter(hookContext) {
    hookContext.filter = hookContext.utilities.getIdentifierQuery(hookContext.id);
    hookContext.utilities.addTenantToFilter(hookContext.filter, hookContext.executionContext);
}

module.exports = { runStepWithHooks, auth, mapOutput, getFilter, setEntityFromInput };
