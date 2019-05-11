'use strict';

//TODO RK these don't exist in a lib version, meed to be passed in
//const { inputValidator, outputValidator } = require('../validation/ajv');
const setAndValidateId = require('./set-and-validate-id');
const setAndValidateName = require('./set-and-validate-name');

/**
 * @param {import('./index').DomainMetadata } metadata
 */
module.exports = function ensureSchemaSet(
    metadata,
    operation,
    direction,
    outputValidator,
    inputValidator
) {
    let schema = metadata.schemas[operation];
    if (!schema) {
        schema = JSON.parse(JSON.stringify(metadata.schemas.core));
        metadata.schemas[operation] = schema;
    }
    setAndValidateId(schema, metadata.schemas.core, operation);
    setAndValidateName(schema, metadata.schemas.core, operation, direction);
    if (direction.toLowerCase() === 'output') {
        if (outputValidator.getSchema(schema.$id)) {
            console.warn(
                `Output schema with $id ${schema.$id} for ${
                    metadata.collectionName
                } already existed, skipping`
            );
        } else {
            outputValidator.addSchema(schema);
        }
    } else {
        if (inputValidator.getSchema(schema.$id)) {
            console.warn(
                `Input schema with $id ${schema.$id} for ${
                    metadata.collectionName
                } already existed, skipping`
            );
        } else {
            inputValidator.addSchema(schema);
        }
    }
};
