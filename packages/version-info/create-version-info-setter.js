'use strict';

const uuid = require('uuid');
const moment = require('moment');
const { IsRequiredError } = require('../common-errors');
const defaultExecutionContextSchema = require('./execution-context-schema');
const { createInputValidator } = require('../validation/ajv');
const v8n = require('v8n');
const get = require('lodash/get');

/**
 * Creates an instance of the Version Info Setter
 * @param {import('./types').CreateVersionInfoSetterOptions} options The options used to construct the versionInfoSetter instance
 * @returns {import('./types').SetVersionInfo} A function to set version info on an object based on a context
 */
// @ts-ignore
module.exports = function createVersionInfoSetter(options) {
    options.validator = options.validator || createInputValidator();
    options.executionContextSchema =
        options.executionContextSchema || defaultExecutionContextSchema;
    if (!options.metadata) {
        throw new IsRequiredError('options.metadata', 'createVersionInfoSetter');
    }
    v8n()
        .string()
        .minLength(1)
        .check(options.executionContextSchema.$id);
    if (!options.validator.getSchema(options.executionContextSchema.$id)) {
        options.validator.addSchema(options.executionContextSchema);
    }
    // eslint-disable-next-line jsdoc/require-param,jsdoc/require-returns
    /** @type {SetVersionInfo} */
    return function setVersionInfo(object, context) {
        validateParams(object, context, options);
        if (object.versionInfo) {
            return updateVersionInfoOnObject(object, context);
        }
        return addVersionInfoToObject(object, context);
    };
};

/**
 * @param {object} object The object to add the version info too
 * @param {import('./types').ExecutionContext} context The context that caused the creation or modification to happen
 * @returns {import('./types').VersionedObject} The object with version info added to it
 */
function addVersionInfoToObject(object, context) {
    object.versionInfo = {
        dateCreated: moment.utc().toDate(),
        versionTag: uuid.v4(),
        dateUpdated: moment.utc().toDate(),
        createdBy: context.identity,
        lastUpdatedBy: context.identity,
        updatedByRequestId: context.requestId,
        createdInVersion: context.codeVersion,
        updatedInVersion: context.codeVersion,
    };
    return object;
}

/**
 * @param {object} object The object to add the version info too
 * @param {import('./types').ExecutionContext} context The context that caused the creation or modification to happen
 * @returns {import('./types').VersionedObject} The object with version info added to it
 */
function updateVersionInfoOnObject(object, context) {
    object.versionInfo.versionTag = uuid.v4();
    object.versionInfo.dateUpdated = moment.utc().toDate();
    object.versionInfo.lastUpdatedBy = context.identity;
    object.versionInfo.updatedByRequestId = context.requestId;
    object.versionInfo.updatedInVersion = context.codeVersion;
    return object;
}

/**
 * @param {object} object The object to add the version info too
 * @param {import('./types').ExecutionContext} context The context that caused the creation or modification to happen
 * @param {import('./types').CreateVersionInfoSetterOptions} options The options passed in to createVersionInfoSetter
 */
function validateParams(object, context, options) {
    if (!object) {
        throw new IsRequiredError('object', 'setVersionInfo');
    }
    options.validator.ensureValid(options.executionContextSchema.$id, context);
    if (get(object, options.metadata.identifier.pathToId) && !object.versionInfo) {
        throw new Error(
            `Object had a value for "${
                options.metadata.identifier.pathToId
            }", indicating that it already exists in the db but no "versionInfo" property was provided, this would cause the creation info to be incorrect and has been prevented.`
        );
    }
}
