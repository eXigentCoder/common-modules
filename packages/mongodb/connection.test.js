'use strict';

const { getDb, getConnectedClient } = require(`./connection`);

describe(`MongoDB`, () => {
    const urlConfig = {
        server: `localhost`,
        dbName: `test-common`,
    };
    describe(`getDb`, () => {
        it(`should return the created db object`, async () => {
            const db = await getDb(urlConfig);
            expect(db).to.be.ok;
        });
        it(`should return the same db object if called twice`, async () => {
            const db = await getDb(urlConfig);
            const db2 = await getDb(urlConfig);
            expect(db).to.eql(db2);
        });
    });
    describe(`getConnectedClient`, () => {
        it(`should return the created client object`, async () => {
            await getDb(urlConfig);
            const client = await getConnectedClient();
            expect(client).to.be.ok;
        });
    });
});
