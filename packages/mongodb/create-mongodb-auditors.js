'use strict';

const ObjectId = require(`mongodb`).ObjectId;
const cloneDeep = require(`lodash/cloneDeep`);
const { IsRequiredError } = require(`../common-errors`);
const moment = require(`moment`);
const get = require(`lodash/get`);
const { removePropertyFromEntity } = require(`../entity-metadata/json-schema-utilities`);
/**
 * @param {import('../entity-metadata').EntityMetadata} metadata
 * @param {import('mongodb').Db} db
 * @returns {Promise<import("./types").Auditors<object>>}
 */
module.exports = async function createMongoDbAuditors(metadata, db) {
    const auditCollection = db.collection(metadata.auditCollectionName);

    /** @type {import("./types").WriteCreation<object>} */
    async function writeCreation(entityAfterCreation, context) {
        await writeAuditEntry(entityAfterCreation, context, `replace`);
    }

    /** @type {import("./types").WriteDeletion<object>} */
    async function writeDeletion(deletedObject, context) {
        await writeAuditEntry(deletedObject, context, `replace`);
    }

    /** @type {import("./types").WriteReplacement<object>} */
    async function writeReplacement(oldEntity, newEntity, context) {
        await writeAuditEntry(newEntity, context, `replace`);
    }

    async function writeAuditEntry(currentEntitState, context, action) {
        if (metadata.auditChanges !== true) {
            return;
        }
        let id = get(currentEntitState, metadata.identifier.pathToId);
        if (!id) {
            throw new IsRequiredError(
                metadata.identifier.pathToId,
                `MongoDB Audit - write ${action}`
            );
        }
        const auditEntry = cloneDeep(currentEntitState);
        if (ObjectId.isValid(id)) {
            id = new ObjectId(id);
        }
        auditEntry._audit = {
            id,
            action,
            date: moment.utc().toDate(),
        };
        removePropertyFromEntity(auditEntry, metadata.identifier.pathToId);
        Object.assign(auditEntry._audit, context);
        await auditCollection.insertOne(auditEntry);
    }

    return {
        writeCreation,
        writeDeletion,
        writeReplacement,
    };
};
