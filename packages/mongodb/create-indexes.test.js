'use strict';

const { getDb, getClient } = require('./connection');
const createIndexes = require('./create-indexes');

describe('MongoDB', () => {
    const urlConfig = {
        server: 'localhost',
        dbName: 'test-common',
    };
    describe('create indexes', () => {
        it('should return the created db object', async () => {
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
after(async () => {
    const client = await getClient();
    if (client) {
        await client.close();
    }
});
