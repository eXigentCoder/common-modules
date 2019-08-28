'use strict';
const mongodb = require(`mongodb`);

module.exports = ajv => {
    ajv.addFormat(`mongoDbObjectId`, isValidMongoDbObjectId);
    ajv.addKeyword(`mongoDbObjectIdCoercion`, {
        validate: validateAndCoerceToMongoDbObjectId,
    });
};

function isValidMongoDbObjectId(input) {
    return mongodb.ObjectId.isValid(input);
}

function validateAndCoerceToMongoDbObjectId(
    coerceType,
    input,
    schema,
    currentDataPath,
    parentDataObject,
    propName
) {
    const valid = isValidMongoDbObjectId(input);
    if (!coerceType) {
        return true;
    }
    if (valid) {
        parentDataObject[propName] =
            coerceType === `object`
                ? new mongodb.ObjectId(input)
                : new mongodb.ObjectId(input).toString();
    }
    return valid;
}
