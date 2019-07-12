'use strict';
const mongo = require(`mongodb`);

module.exports = ajv => {
    ajv.addFormat(`mongoId`, isValidMongoId);
    ajv.addKeyword(`mongoId`, {
        validate: validateAndCoerceToMongoId,
    });
};

function isValidMongoId(input) {
    return mongo.ObjectId.isValid(input);
}

function validateAndCoerceToMongoId(
    isMongoId,
    input,
    schema,
    currentDataPath,
    parentDataObject,
    propName
) {
    if (!isMongoId) {
        return true;
    }
    const valid = isValidMongoId(input);
    if (valid) {
        parentDataObject[propName] = new mongo.ObjectId(input);
    }
    return valid;
}
