'use strict';

const { getDb, getClient } = require('../mongodb/connection');
const populateFromDisk = require('.');
const path = require('path');
describe('MongoDB Populate From Disk', () => {
    const urlConfig = {
        server: 'localhost',
        dbName: 'test-common',
    };
    describe('populate from disk', () => {
        it('should throw an error if no working directory provided', async () => {
            const db = await getDb(urlConfig);
            // @ts-ignore
            await expect(populateFromDisk(db)).to.be.rejected;
        });

        it('should successfully load and populate the data', async () => {
            const db = await getDb(urlConfig);
            /**@type {import('.').Options} */
            const options = {
                dropExistingData: true,
                workingDirectory: path.join(__dirname, 'test-data'),
            };
            await populateFromDisk(db, options);
        });
    });
});
after(async () => {
    const client = await getClient();
    if (client) {
        await client.close();
    }
});
