'use strict';

const {
    addMongoId,
} = require('@bit/exigentcoder.common-modules.validation-mongodb');
const {
    createInputValidator,
    createOutputValidator,
} = require('@bit/exigentcoder.common-modules.validation');
const firebaseDateTimeMapper = require('./firebase-date-time-mapper');
const inputValidator = createInputValidator(addMongoId);
const outputValidator = createOutputValidator(
    firebaseDateTimeMapper,
    addMongoId
);

module.exports = { inputValidator, outputValidator };
