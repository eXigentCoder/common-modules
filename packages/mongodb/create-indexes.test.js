'use strict';

const { getDb } = require('./mongodb');
const createIndexes = require('./create-indexes');

describe('Mongodb', () => {
    describe('create indexes', () => {
        it('should return the created db object', async () => {
            const urlConfig = {
                server: 'localhost',
                dbName: 'test-common',
            };
            const db = await getDb(urlConfig);
            const collectionName = 'users';
            const indexes = [
                {
                    key: {
                        name: 1,
                    },
                    options: {
                        name: 'unique-name',
                        unique: true,
                    },
                },
            ];
            await createIndexes(db, collectionName, indexes);
        });
    });
});
