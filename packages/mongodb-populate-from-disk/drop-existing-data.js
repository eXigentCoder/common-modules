'use strict';

const collectionsToSkipWhenClearing = ['system.indexes'];

/**@param {import('mongodb').Db} db The mongodb instance */
module.exports = async function dropExistingData(db) {
    console.log('Loading collections...');
    const collections = await db.collections();
    console.log(`\tDone, ${collections.length} collections found.`);
    console.log('Clearing items in collections...');
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
        if (err && err.message && err.message === 'ns not found') {
            console.warn(`Collection "${name}" did not exist`);
            return;
        }
        throw err;
    }
}
