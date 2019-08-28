'use strict';

const {
    addMongoDbObjectId,
} = require(`@bit/exigentcoder.common-modules.validation-mongodb`);
const {
    createInputValidator,
    createOutputValidator,
} = require(`@bit/exigentcoder.common-modules.validation`);
const firebaseDateTimeMapper = require(`./firebase-date-time-mapper`);
const inputValidator = createInputValidator(addMongoDbObjectId);
const outputValidator = createOutputValidator(
    firebaseDateTimeMapper,
    addMongoDbObjectId
);

module.exports = { inputValidator, outputValidator };
