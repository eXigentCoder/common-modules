'use strict';

const { getDb, getClient } = require('./mongodb');

describe('Mongodb', () => {
    describe('getDb', () => {
        it('should return the created db object', async () => {
            const urlConfig = {
                server: 'localhost',
                dbName: 'test-common',
            };
            const db = await getDb(urlConfig);
            expect(db).to.be.ok;
        });
    });
    describe('getClient', () => {
        it('should return the created client object', async () => {
            const urlConfig = {
                server: 'localhost',
                dbName: 'test-common',
            };
            const client = await getClient(urlConfig);
            expect(client).to.be.ok;
        });
    });
});
