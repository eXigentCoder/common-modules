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
    return function setStatusesIfApplicable(entity, context) {
        if (!metadata.statuses || metadata.statuses.length === 0) {
            return;
        }
        const now = moment.utc().toISOString();
        for (const definition of metadata.statuses) {
            const currentValue = get(entity, definition.pathToStatusField);
            const firstStatus = definition.allowedValues[0].name;
            const log = get(entity, definition.pathToStatusLogField, []);
            const statusData = get(entity, definition.pathToStatusDataField);
            unset(entity, definition.pathToStatusDataField);
            log.push({
                status: currentValue || firstStatus,
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
            set(entity, definition.pathToStatusField, firstStatus);
            set(entity, definition.pathToStatusDateField, now);
            set(entity, definition.pathToStatusLogField, log);
        }
    };
}
module.exports = { createSetStatusesIfApplicable };
