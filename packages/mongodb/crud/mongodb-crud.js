'use strict';

const getUtils = require(`./utilities/get-utilities`);

const {
    runStepWithHooks,
    getAuthorizeFn,
    mapEntityForOutput,
    setFilterFromId,
    setEntityFromInput,
    getValidateEntityFn,
    getWriteAuditEntryFn,
    setEntityFromDbUsingFilter,
    authorizeQuery,
    moveCurrentEntityToExisting,
    insertEntityIntoDb,
    deleteFromDbUsingFilter,
    replace,
    setEntityFromDBUsingQuery,
    setMetadataFields,
} = require(`./steps`);
/**
 * @typedef {import('../../entity-metadata').EntityMetadata} EntityMetadata
 * @typedef {import('../types').CreateUtilityParams} CreateUtilityParams
 * @typedef {import('../types').Utilities} Utilities
 * @typedef {import('../types').Crud<object>} Crud
 * @typedef {Crud & {utilities:Utilities}} GetCrud
 */

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
    return async function create(_entity, executionContext, hooks) {
        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            input: _entity,
            utilities,
            hooks,
        };
        await runStepWithHooks(setEntityFromInput, hookContext);
        await runStepWithHooks(getValidateEntityFn(`create`), hookContext);
        await runStepWithHooks(setMetadataFields, hookContext);
        await runStepWithHooks(getAuthorizeFn(`create`), hookContext);
        await runStepWithHooks(getValidateEntityFn(`core`), hookContext);
        await runStepWithHooks(insertEntityIntoDb, hookContext);
        await runStepWithHooks(getWriteAuditEntryFn(`create`), hookContext);
        await runStepWithHooks(mapEntityForOutput, hookContext);
        return hookContext.entity;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").GetById<object>} A function to get entities by their identifiers
 */
function getGetById(utilities) {
    return async function getById(id, executionContext, hooks) {
        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            id,
            utilities,
            hooks,
        };
        await runStepWithHooks(setFilterFromId, hookContext);
        await runStepWithHooks(setEntityFromDbUsingFilter, hookContext);
        await runStepWithHooks(getAuthorizeFn(`retrieve`), hookContext);
        await runStepWithHooks(mapEntityForOutput, hookContext);
        return hookContext.entity;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").DeleteById<object>} A function to delete entities by their identifier
 */
function getDeleteById(utilities) {
    return async function deleteById(id, executionContext, hooks) {
        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            id,
            utilities,
            hooks,
        };
        await runStepWithHooks(setFilterFromId, hookContext);
        await runStepWithHooks(setEntityFromDbUsingFilter, hookContext);
        await runStepWithHooks(getAuthorizeFn(`delete`), hookContext);
        await runStepWithHooks(deleteFromDbUsingFilter, hookContext);
        await runStepWithHooks(getWriteAuditEntryFn(`delete`), hookContext);
    };
}
/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").ReplaceById<object>} A function to replace documents based off of their _id
 */
function getReplaceById(utilities) {
    return async function replaceById(id, _entity, executionContext, hooks) {
        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            input: _entity,
            id,
            utilities,
            hooks,
        };

        await runStepWithHooks(setFilterFromId, hookContext);
        await runStepWithHooks(setEntityFromDbUsingFilter, hookContext);
        await runStepWithHooks(getAuthorizeFn(`update`), hookContext);
        await runStepWithHooks(moveCurrentEntityToExisting, hookContext);
        await runStepWithHooks(setEntityFromInput, hookContext);
        await runStepWithHooks(getValidateEntityFn(`replace`), hookContext);
        await runStepWithHooks(setMetadataFields, hookContext);
        await runStepWithHooks(getValidateEntityFn(`core`), hookContext);
        await runStepWithHooks(replace, hookContext);
        await runStepWithHooks(getWriteAuditEntryFn(`replace`), hookContext);
        await runStepWithHooks(mapEntityForOutput, hookContext);
        return hookContext.entity;
    };
}

/**
 * @param {Utilities} utilities The input utilities to create the function
 * @returns {import("../types").Search<object>} A function to search for entities
 */
function getSearch(utilities) {
    return async function search(query, executionContext, hooks) {
        /** @type {import('../types').Query} */
        // @ts-ignore
        let queryObj = query.filter ? query : { filter: query };

        /**@type {import('../types').HookContext} */
        const hookContext = {
            executionContext,
            utilities,
            query: queryObj,
            hooks,
        };
        await runStepWithHooks(authorizeQuery, hookContext);
        await runStepWithHooks(setEntityFromDBUsingQuery, hookContext);
        await runStepWithHooks(mapEntityForOutput, hookContext);
        return {
            items: hookContext.entity,
        };
    };
}

module.exports = { getUtils, getCrud };
