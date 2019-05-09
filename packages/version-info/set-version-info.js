'use strict';

const uuid = require('uuid');
const moment = require('moment');
const { IsRequiredError } = require('../common-errors');
const executionContextSchema = require('./execution-context-schema');
const { createInputValidator } = require('../validation/ajv');

/**
 * @typedef {{ id:string }} Identity The entity which made the change
 * @typedef {{ dateCreated:Date, versionTag: string, dateUpdated:Date, createdBy:Identity, lastUpdatedBy:Identity, updatedByRequestId:string }} VersionInfo
 * @typedef {{ requestId:string, identity:Identity, codeVersion:string, sourceIp: string }} ExecutionContext
 * @typedef {{ versionInfo:VersionInfo }} VersionedObject
 */

// @ts-ignore
module.exports = function({ inputValidator } = {}) {
    inputValidator = inputValidator || createInputValidator();
    inputValidator.addSchema(executionContextSchema);
    /**
     * @param {object} object
     * @param {ExecutionContext} context
     * @returns {VersionedObject}
     */
    return function setVersionInfo(object, context) {
        validateParams(object, context, inputValidator);
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
function validateParams(object, context, inputValidator) {
    if (!object) {
        throw new IsRequiredError('object', 'setVersionInfo');
    }
    inputValidator.ensureValid(executionContextSchema.$id, context);
    //todo RK What if the ID property is not _id but id or ID or identity, maybe need this from metadata?
    if (object._id && !object.versionInfo) {
        throw new Error(
            'Object had the "_id" property, indicating that it already exists in the db but no "versionInfo" property was provided, this would cause the creation info to be incorrect and has been prevented.'
        );
    }
}
