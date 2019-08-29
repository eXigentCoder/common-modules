'use strict';

const jsf = require(`json-schema-faker`);
const ObjectId = require(`mongodb`).ObjectId;
const uuid = require(`uuid`);
const faker = require(`faker`);

jsf.format(`mongoDbObjectId`, () => {
    return new ObjectId().toString();
});

jsf.format(`uuid`, () => {
    return uuid.v4();
});

jsf.extend(`faker`, () => {
    // @ts-ignore
    faker.custom = {
        mongoId: () => {
            return new ObjectId().toString();
        },
    };
    return faker;
});

module.exports = jsf;
