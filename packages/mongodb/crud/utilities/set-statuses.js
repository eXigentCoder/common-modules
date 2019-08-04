'use strict';
const get = require(`lodash/get`);
const set = require(`lodash/set`);
const unset = require(`lodash/unset`);

const moment = require(`moment`);
/**
 *
 * @param {import("../../../entity-metadata/types").EntityMetadata} metadata
 * @returns {import("../../types").SetStatusesIfApplicable}
 */
function createSetStatusesIfApplicable(metadata) {
    return function setStatusesIfApplicable(entity, existingEntity, context) {
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
        if (!newStatus) {
            throw new Error(`Allowed to clear statuses?`);
        }
        const oldValue = get(existingEntity, definition.pathToStatusField);
        if (!oldValue) {
            return setStatusForNewEntity({ definition, entity, now });
        }
        if (newStatus === oldValue) {
            return;
        }
        const log = get(entity, definition.pathToStatusLogField, []);
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
        const currentValue = get(entity, definition.pathToStatusField);
        const firstStatus = definition.allowedValues[0].name;
        const statusToSet = currentValue || firstStatus;
        const log = get(entity, definition.pathToStatusLogField, []);
        const statusData = get(entity, definition.pathToStatusDataField);
        unset(entity, definition.pathToStatusDataField);
        log.push({
            status: statusToSet,
            statusDate: now,
            data: statusData,
        });
        if (currentValue) {
            const newDate = get(entity, definition.pathToStatusDateField, now);
            set(entity, definition.pathToStatusDateField, newDate);
            const newLog = get(entity, definition.pathToStatusLogField, log);
            set(entity, definition.pathToStatusLogField, newLog);
            return;
        }
        if (!definition.isRequired) {
            return; //not required so skip until someone sets it.
        }
        set(entity, definition.pathToStatusField, statusToSet);
        set(entity, definition.pathToStatusDateField, now);
        set(entity, definition.pathToStatusLogField, log);
    }
}
module.exports = { createSetStatusesIfApplicable };
