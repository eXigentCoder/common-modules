'use strict';

const glob = require('glob');
const util = require('util');
const loadGlob = util.promisify(glob);
const path = require('path');
const _ = require('lodash');
/**
 * @param {import('mongodb').Db} db The mongodb instance
 * @param {string} directory The directory from which to find the test data
 */
module.exports = async function(db, directory) {
    const collections = await findCollections(directory);
    for (const collection of collections) {
        await findDataForCollection(collection, db, directory);
    }
};

async function findCollections(directory) {
    const testDataGlobPattern = path.join(directory, '/*/');
    const foundTestDataDirectories = await loadGlob(testDataGlobPattern);
    const collections = [];
    foundTestDataDirectories.forEach(function(result) {
        collections.push({
            name: path.basename(result),
            globPath: result,
        });
    });
    return collections;
}

async function findDataForCollection(collection, db, directory) {
    const testDataFileGlobPattern = path.join(directory, collection.name, '/*.js?(on)');
    const foundTestDataFiles = await loadGlob(testDataFileGlobPattern);
    /**@type {import('mongodb').Collection} */
    const dbCollection = db.collection(collection.name);
    for (const result of foundTestDataFiles) {
        const testFileData = await loadTestFileData(result);
        try {
            if (Array.isArray(testFileData.data)) {
                await dbCollection.insertMany(testFileData.data);
            } else {
                await dbCollection.insertOne(testFileData.data);
            }
            console.log(testFileData.filename + ' inserted successfully');
        } catch (err) {
            console.error(testFileData.filename + ' failed to insert');
            throw err;
        }
    }
}

async function loadTestFileData(result) {
    const relativeFilePath = './' + path.relative(__dirname, result).replace(/\\/g, '/');
    let fileData = require(relativeFilePath);
    if (_.isFunction(fileData)) {
        fileData = await fileData();
    }
    return {
        filename: path.basename(result),
        globPath: result,
        data: fileData,
    };
}
