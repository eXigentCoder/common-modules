'use strict';

const { getDb } = require('../mongodb/mongodb');
const populateFromDisk = require('./');
const path = require('path');
describe('Mongodb', () => {
    describe('populate from disk', () => {
        const urlConfig = {
            server: 'localhost',
            dbName: 'test-common',
        };
        it('should throw an error if no working directory provided', async () => {
            const db = await getDb(urlConfig);
            // @ts-ignore
            await expect(populateFromDisk(db)).to.be.rejected;
        });

        it('should successfully load and populate the data', async () => {
            const db = await getDb(urlConfig);
            /**@type {import('./').Options} */
            const options = {
                dropExistingData: true,
                workingDirectory: path.join(__dirname, 'test-data'),
            };
            await populateFromDisk(db, options);
        });
    });
});
