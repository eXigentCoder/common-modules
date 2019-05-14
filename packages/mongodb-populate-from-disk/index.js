'use strict';

const dropExistingData = require('./drop-existing-data');
const createTestData = require('./create-test-data');
const v8n = require('v8n');
/**
 * @typedef {Object} Options
 * @property {string} options.workingDirectory
 * @property {boolean} [options.dropExistingData=false]
 *
 * @param {import('mongodb').Db} db The mongodb instance
 * @param {Options} options The options used to generate the data
 */
// @ts-ignore
module.exports = async function populateDbFromDisk(db, options = {}) {
    v8n()
        .string()
        .minLength(1)
        .check(options.workingDirectory);
    if (options.dropExistingData) {
        await dropExistingData(db);
    }
    await createTestData(db, options.workingDirectory);
};
