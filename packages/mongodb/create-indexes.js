'use strict';

/**
 * @typedef {object} Index
 * @property {string | any} key
 * @property {import('mongodb').IndexOptions} options
 */

/**
 * @param {import('mongodb').Db} db The MongoDB db object connected to the database
 * @param {string} collectionName The name of the collection in the database
 * @param {Index[]} indexes The indexs to be created
 * @returns {Promise<undefined>}
 */
module.exports = async function createIndexes(db, collectionName, indexes) {
    await db.createCollection(collectionName);
    const collection = db.collection(collectionName);
    if (!indexes || indexes.length <= 0) {
        return;
    }
    const existingIndexes = await collection.indexes();
    for (const index of indexes) {
        await ensureIndexExists(index, collectionName, existingIndexes, db);
    }
};

/**
 * @param {Index} index The index to be created
 * @param {string} collectionName The name of the collection in the database
 * @param {import('mongodb').IndexOptions[]} existingIndexes The collection of existing indexes
 * @param {import('mongodb').Db} db The MongoDB db object connected to the database
 * @returns {Promise<undefined>}
 */
async function ensureIndexExists(index, collectionName, existingIndexes, db) {
    let collection = db.collection(collectionName);
    let existingIndex = findExistingIndex(index, existingIndexes);
    if (!existingIndex) {
        await collection.createIndex(index.key, index.options);
        return;
    }
    if (!shouldDropAndCreate(index, existingIndex)) {
        return;
    }
    await collection.dropIndex(existingIndex.name);
    await collection.createIndex(index.key, index.options);
}
/**
 * @param {Index} indexToCreate The spec of the index
 * @param {import('mongodb').IndexOptions[]}existingIndexes The eixising indexes in the db
 * @returns {import('mongodb').IndexOptions | null} The found index or null if one was not found
 */
function findExistingIndex(indexToCreate, existingIndexes) {
    let foundIndex = null;
    existingIndexes.some(function(existingIndex) {
        if (
            existingIndex.name &&
            indexToCreate.options.name &&
            existingIndex.name.toLowerCase().trim() ==
                indexToCreate.options.name.toLowerCase().trim()
        ) {
            foundIndex = existingIndex;
            return true;
        }
        return false;
    });
    return foundIndex;
}

/**
 * @param {Index} indexToCreate the spec of the index
 * @param {import('mongodb').IndexOptions} foundIndex The existing index
 * @returns {boolean} a value indicating if the index should be dropped and recreated
 */
function shouldDropAndCreate(indexToCreate, foundIndex) {
    if (foundIndex.unique !== indexToCreate.options.unique) {
        return true;
    }
    if (foundIndex.name !== indexToCreate.options.name) {
        return true;
    }
    if (foundIndex.background !== indexToCreate.options.background) {
        return true;
    }
    if (foundIndex.expireAfterSeconds !== indexToCreate.options.expireAfterSeconds) {
        return true;
    }
    if (foundIndex.sparse !== indexToCreate.options.sparse) {
        return true;
    }
    return false;
}
