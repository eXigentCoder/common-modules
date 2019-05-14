'use strict';

const { getDb, getClient } = require('./connection');

describe('Mongodb', () => {
    const urlConfig = {
        server: 'localhost',
        dbName: 'test-common',
    };
    describe('getDb', () => {
        it('should return the created db object', async () => {
            const db = await getDb(urlConfig);
            expect(db).to.be.ok;
        });
        it('should return the same db object if called twice', async () => {
            const urlConfig = {
                server: 'localhost',
                dbName: 'test-common',
            };
            const db = await getDb(urlConfig);
            const db2 = await getDb(urlConfig);
            expect(db).to.eql(db2);
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
    afterEach(async () => {
        const client = await getClient(urlConfig);
        client.close();
    });
});
