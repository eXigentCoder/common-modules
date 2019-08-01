'use strict';
const get = require(`lodash/get`);
const set = require(`lodash/set`);
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
            const log = get(entity, `${definition.pathToStatusField}Log`, []);
            log.push({
                status: currentValue || firstStatus,
                statusDate: now,
                //data:??
            });
            if (currentValue) {
                const newDate = get(entity, `${definition.pathToStatusField}Date`, now);
                set(entity, `${definition.pathToStatusField}Date`, newDate);
                const newLog = get(entity, `${definition.pathToStatusField}Log`, log);
                set(entity, `${definition.pathToStatusField}Log`, newLog);
                return;
            }
            if (!definition.isRequired) {
                return; //not required so skip until someone sets it.
            }
            set(entity, definition.pathToStatusField, firstStatus);
            set(entity, `${definition.pathToStatusField}Date`, now);
            set(entity, `${definition.pathToStatusField}Log`, log);
        }
    };
}
module.exports = { createSetStatusesIfApplicable };
