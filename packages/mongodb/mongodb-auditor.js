'use strict';
const { badImplementation } = require('@hapi/boom');
const util = require('util');
/**
 * @typedef {(oldItem:Object,newItem:Object,context:Object)=>Promise<void>} WriteAuditEntry
 */
/**
 * @param {import('@bit/exigentcoder.common-modules.entity-metadata').EntityMetadata} metadata
 * @param {string} action
 * @returns {WriteAuditEntry}
 */
function createAuditor(metadata, action, getDb) {
    return async function writeAuditEntry(oldItem, newItem, context) {
        if (metadata.trackHistory !== true) {
            return;
        }
        let entity = newItem;
        if (!entity) {
            entity = oldItem;
        }
        if (!entity) {
            throw badImplementation(
                `Either oldItem or newItem must be supplied for action ${action} and ${util.inspect(
                    context
                )}`
            );
        }
        if (entity._audit) {
            throw badImplementation(
                `Entity already had an _audit property set on it.${util.inspect(entity)}`
            );
        }
        if (!entity._id) {
            throw badImplementation(`Entity must have an _id property.${util.inspect(entity)}`);
        }
        entity = JSON.parse(JSON.stringify(entity));
        entity._audit = {
            _id: entity._id,
        };
        delete entity._id;
        Object.assign(entity._audit, context);
        const db = await getDb();
        const auditCollection = db.collection(metadata.collectionName + '-audit');
        try {
            const { result } = await auditCollection.insertOne(entity);
            if (!result.ok) {
                console.error(`Unable to create audit entry for ${metadata.title}`);
            }
            if (result.n === 0) {
                console.error(
                    `Unable to create audit entry for ${metadata.title}, inserted documents was 0`
                );
            }
            if (result.n > 1) {
                console.error(
                    `Multiple audit entry for ${metadata.titlePlural} were created (${
                        result.n
                    }) when calling insertOne, should have been exactly 1`
                );
            }
        } catch (err) {
            console.error(
                `Error writing audit entry ${util.inspect(err)}.\n\tEntry:\n${util.inspect(entity)}`
            );
        }
    };
}
module.exports = {};
