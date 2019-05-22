'use strict';

const ObjectId = require('mongodb').ObjectId;
const cloneDeep = require('lodash/cloneDeep');
const { IsRequiredError } = require('../common-errors');

//TODO RK What if using the mongodb auditor for an entity that doesn't have _id, need to use the metadata.identifier!

/**
 * @param {import('../entity-metadata').EntityMetadata} metadata
 * @param {import('./mongodb-crud').Db} db
 * @returns
 */
module.exports = async function createMongoDbAuditors(metadata, db) {
    const auditCollection = db.collection(metadata.auditCollectionName);

    async function writeCreation(entityAfterCreation, context) {
        if (metadata.auditChanges !== true) {
            return;
        }
        if (!entityAfterCreation._id) {
            throw new IsRequiredError('_id', 'MongoDB Audit - writeCreation');
        }
        const auditEntry = cloneDeep(entityAfterCreation);
        auditEntry._audit = {
            _id: new ObjectId(entityAfterCreation._id),
            action: 'create',
            date: new Date(),
        };
        delete auditEntry._id;
        Object.assign(auditEntry._audit, context);
        await auditCollection.insertOne(auditEntry);
    }

    async function writeDeletion(deletedObject, context) {
        if (metadata.auditChanges !== true) {
            return;
        }
        // const auditEntry = {
        //     _audit: {
        //         _id: new ObjectId(entityAfterCreation._id),
        //         action: 'create',
        //         date: new Date(),
        //     },
        // };
        // delete auditEntry._id;
        // Object.assign(auditEntry._audit, context);
        // await auditCollection.insertOne(auditEntry);
    }

    async function writeReplacement(oldEntity, newEntity, context) {
        if (metadata.auditChanges !== true) {
            return;
        }
    }

    async function writeUpdate(deletedEntityId, context) {
        if (metadata.auditChanges !== true) {
            return;
        }
    }

    return {
        writeCreation,
        writeDeletion,
        writeReplacement,
        writeUpdate,
    };
};
