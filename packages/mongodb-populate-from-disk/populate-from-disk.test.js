'use strict';

const { getDb, getClient, close } = require(`../mongodb/connection`);
const { populateDbFromDisk } = require(`.`);

const path = require(`path`);
describe(`MongoDB Populate From Disk`, () => {
    const urlConfig = {
        server: `localhost`,
        dbName: `test-common`,
    };
    describe(`populate from disk`, () => {
        it(`should throw an error if no working directory provided`, async () => {
            const db = await getDb(urlConfig);
            // @ts-ignore
            await expect(populateDbFromDisk(db)).to.be.rejected;
        });

        it(`should successfully load and populate the data`, async () => {
            const db = await getDb(urlConfig);
            /**@type {import('.').Options} */
            const options = {
                dropExistingData: true,
                workingDirectory: path.join(__dirname, `test-data`),
            };
            await populateDbFromDisk(db, options);
        });
    });
});
after(async () => {
    await close();
});
