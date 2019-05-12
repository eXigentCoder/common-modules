'use strict';

const uuid = require('uuid');
const moment = require('moment');
const { IsRequiredError } = require('../common-errors');
const defaultExecutionContextSchema = require('./execution-context-schema');
const { createInputValidator } = require('../validation/ajv');
const v8n = require('v8n');
/**
 * @typedef {{ id:string }} Identity The entity which made the change
 * @typedef {{ dateCreated:Date, versionTag: string, dateUpdated:Date, createdBy:Identity, lastUpdatedBy:Identity, updatedByRequestId:string }} VersionInfo
 * @typedef {{ requestId:string, identity:Identity, codeVersion:string, sourceIp: string }} ExecutionContext
 * @typedef {{ versionInfo:VersionInfo }} VersionedObject
 * @typedef {(object:object,context: ExecutionContext)=>VersionedObject} SetVersionInfo

 */

/**
 * Creates an instance of the Version Info Setter
 *
 * @param {object} [options={}]
 * @param {import('../entity-metadata/index').DomainMetadata} options.metadata
 * @param {import('ajv').Ajv} [options.validator] The Ajv validator used to validate the execution context
 * @param {object} [options.executionContextSchema] The schema for the execution context
 * @returns {SetVersionInfo}
 */
// @ts-ignore
module.exports = function createVersionInfoSetter(options = {}) {
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
    options.validator.addSchema(options.executionContextSchema);
    /**
     * @type {SetVersionInfo}
     */
    return function setVersionInfo(object, context) {
        validateParams(object, context, options);
        if (object.versionInfo) {
            return updateVersionInfoOnObject(object, context);
        }
        return addVersionInfoToObject(object, context);
    };
};

/**
 * @param {object} object
 * @param {ExecutionContext} context
 * @returns {VersionedObject}
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
 * @param {object} object
 * @param {ExecutionContext} context
 * @returns {VersionedObject}
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
 * @param {object} object
 * @param {ExecutionContext} context
 * @returns {void}
 */
function validateParams(object, context, options) {
    if (!object) {
        throw new IsRequiredError('object', 'setVersionInfo');
    }
    options.validator.ensureValid(options.executionContextSchema.$id, context);
    //todo RK What if the ID property is not _id but id or ID or identity, maybe need this from metadata?
    if (object[options.metadata.identity.name] && !object.versionInfo) {
        throw new Error(
            `Object had the "${
                options.metadata.identity.name
            }" property, indicating that it already exists in the db but no "versionInfo" property was provided, this would cause the creation info to be incorrect and has been prevented.`
        );
    }
}
