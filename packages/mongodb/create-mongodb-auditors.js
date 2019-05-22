'use strict';

const ObjectId = require('mongodb').ObjectId;
const cloneDeep = require('lodash/cloneDeep');
const { IsRequiredError } = require('../common-errors');
const moment = require('moment');

/**
 * @param {import('../entity-metadata').EntityMetadata} metadata
 * @param {import('./mongodb-crud').Db} db
 * @returns
 */
module.exports = async function createMongoDbAuditors(metadata, db) {
    const auditCollection = db.collection(metadata.auditCollectionName);

    async function writeCreation(entityAfterCreation, context) {
        await writeAuditEntry(entityAfterCreation, context, 'replace');
    }

    async function writeDeletion(deletedObject, context) {
        await writeAuditEntry(deletedObject, context, 'replace');
    }

    async function writeReplacement(oldEntity, newEntity, context) {
        await writeAuditEntry(newEntity, context, 'replace');
    }

    async function writeAuditEntry(currentEntitState, context, action) {
        if (metadata.auditChanges !== true) {
            return;
        }
        let id = currentEntitState[metadata.identifier.name];
        if (!id) {
            throw new IsRequiredError(metadata.identifier.name, `MongoDB Audit - write ${action}`);
        }
        const auditEntry = cloneDeep(currentEntitState);
        if (ObjectId.isValid(id)) {
            id = new ObjectId(id);
        }
        auditEntry._audit = {
            [metadata.identifier.name]: id,
            action,
            date: moment.utc().toDate(),
        };
        delete auditEntry[metadata.identifier.name];
        Object.assign(auditEntry._audit, context);
        await auditCollection.insertOne(auditEntry);
    }

    return {
        writeCreation,
        writeDeletion,
        writeReplacement,
    };
};
