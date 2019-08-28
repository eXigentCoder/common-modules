'use strict';

const jsf = require(`json-schema-faker`);
const ObjectId = require(`mongodb`).ObjectId;
const uuid = require(`uuid`);

jsf.format(`mongoDbObjectId`, () => {
    return new ObjectId().toString();
});

jsf.format(`uuid`, () => {
    return uuid.v4();
});

module.exports = jsf;
