'use strict';

const collectionsToSkipWhenClearing = [`system.indexes`];

/**
 * @param {import('mongodb').Db} db The mongodb instance
 * @param {boolean} force Specifies if it should drop data even if on prod
 * @returns {void}
 */
module.exports = async function dropExistingData(db, force) {
    if (process.env.NODE_ENV.toLowerCase().includes(`prod`) && !force) {
        throw new Error(
            `NODE_ENV contained "prod" (${process.env.NODE_ENV}) so dropping data has been aborted`
        );
    }
    console.log(`Loading collections...`);
    const collections = await db.collections();
    console.log(`\tDone, ${collections.length} collections found.`);
    console.log(`Clearing items in collections...`);
    for (const collection of collections) {
        await clearItemsInCollection(collection, db);
    }
};

async function clearItemsInCollection(collection, db) {
    const name = collection.s.name;
    if (collectionsToSkipWhenClearing.indexOf(name) >= 0) {
        return;
    }
    try {
        await db.dropCollection(name);
    } catch (err) {
        if (err && err.message && err.message === `ns not found`) {
            console.warn(`Collection "${name}" did not exist`);
            return;
        }
        throw err;
    }
}
