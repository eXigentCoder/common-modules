'use strict';

const jsf = require(`./`);
const ObjectId = require(`mongodb`).ObjectId;

describe(`Json Schema Faker`, () => {
    describe(`mongoDbObjectId`, function() {
        const schemaWithFormat = {
            type: `object`,
            properties: {
                id: {
                    type: `string`,
                    format: `mongoDbObjectId`,
                },
            },
            required: [`id`],
        };

        it(`should return a valid ObjectId if the format is specified`, function() {
            for (let i = 0; i < 100; i++) {
                const item = jsf(schemaWithFormat);
                expect(item.id).to.be.ok;
                expect(ObjectId.isValid(item.id)).to.be.true;
            }
        });
    });
});
