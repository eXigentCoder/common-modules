'use strict';
const get = require(`lodash/get`);
const set = require(`lodash/set`);
const unset = require(`lodash/unset`);
const moment = require(`moment`);
const { ValidationError } = require(`../../../common-errors`);
/**
 *
 * @param {import("../../../entity-metadata/types").EntityMetadata} metadata
 * @returns {import("../../types").SetStatusesIfApplicable}
 */
function createSetStatusesIfApplicable(metadata) {
    return function setStatusesIfApplicable(entity, existingEntity) {
        if (!metadata.statuses || metadata.statuses.length === 0) {
            return;
        }
        const now = moment.utc().toISOString();

        for (const definition of metadata.statuses) {
            if (existingEntity) {
                updateStatusForExistingEntity({ definition, entity, existingEntity, now });
            } else {
                setStatusForNewEntity({ definition, entity, now });
            }
        }
    };
    function updateStatusForExistingEntity({ definition, entity, existingEntity, now }) {
        const newStatus = get(entity, definition.pathToStatusField);
        const oldStatus = get(existingEntity, definition.pathToStatusField);
        const sameStatus = newStatus === oldStatus;
        const clearingStatus = !newStatus && !!oldStatus;
        const settingStatusForTheFirstTime = !oldStatus && !!newStatus;
        //const updatingStatus = !!oldStatus && !!newStatus && !sameStatus;
        if (sameStatus) {
            return;
        }
        if (clearingStatus) {
            if (definition.isRequired) {
                throw new ValidationError(
                    `${definition.pathToStatusField} is required and cannot be cleared from the ${metadata.title}`
                );
            }
        }
        if (settingStatusForTheFirstTime) {
            return setStatusForNewEntity({ definition, entity, now });
        }

        const log = get(existingEntity, definition.pathToStatusLogField, []);
        const statusData = get(entity, definition.pathToStatusDataField);
        unset(entity, definition.pathToStatusDataField);
        log.push({
            status: newStatus,
            statusDate: now,
            data: statusData,
        });
        set(entity, definition.pathToStatusDateField, now);
        set(entity, definition.pathToStatusLogField, log);
    }

    function setStatusForNewEntity({ definition, entity, now }) {
        const specifiedValue = get(entity, definition.pathToStatusField);
        const firstStatus = definition.allowedValues[0].name;
        const statusToSet = specifiedValue || firstStatus;
        const statusData = get(entity, definition.pathToStatusDataField);
        unset(entity, definition.pathToStatusDataField);
        const log = [
            {
                status: statusToSet,
                statusDate: now,
                data: statusData,
            },
        ];
        if (!specifiedValue && !definition.isRequired) {
            if (statusData) {
                throw new Error(`Can't specify status data but no status.`);
            }
            return; //not required and not specified so skip until someone sets it.
        }
        set(entity, definition.pathToStatusField, statusToSet);
        set(entity, definition.pathToStatusDateField, now);
        set(entity, definition.pathToStatusLogField, log);
    }
}
module.exports = { createSetStatusesIfApplicable };
