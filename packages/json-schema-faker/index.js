'use strict';

const jsf = require(`json-schema-faker`);
const ObjectId = require(`mongodb`).ObjectId;
const faker = require(`faker`);
const uuid = require(`uuid`);

jsf.extend(`faker`, () => {
    // @ts-ignore
    faker.custom = {
        mongoId: () => {
            return new ObjectId().toString();
        },
    };
    return faker;
});

jsf.format(`mongoId`, () => {
    return new ObjectId().toString();
});

jsf.format(`uuid`, () => {
    return uuid.v4();
});

module.exports = jsf;
