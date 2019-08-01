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
            if (currentValue) {
                return; //already set, maybe validate it's legit?
            }
            if (!definition.isRequired) {
                return; //not required so skip until someone sets it.
            }
            const newStatus = definition.allowedValues[0].name;
            set(entity, definition.pathToStatusField, newStatus);
            set(entity, `${definition.pathToStatusField}Date`, now);
            const log = get(entity, `${definition.pathToStatusField}Log`, []);
            log.push({
                status: newStatus,
                statusDate: now,
                //data:??
            });
            set(entity, `${definition.pathToStatusField}Log`, log);
            //set log
            //set date
        }
    };
}
module.exports = { createSetStatusesIfApplicable };
