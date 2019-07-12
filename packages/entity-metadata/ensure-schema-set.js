'use strict';

const setAndValidateId = require(`./set-and-validate-id`);
const setAndValidateTitle = require(`./set-and-validate-title`);

/**
 * @typedef {import('./types').Validator} Validator
 *
 * @param {import('./types').EntityMetadata} metadata
 * @param {string} operation The operation to be performed [output, create, replace]
 * @param {string} direction The data flow direction [Output, Input]
 * @param {Validator} outputValidator The validator for transforming entities to output
 * @param {Validator} inputValidator The validator for ensuring entitie passed in are valid
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
    setAndValidateTitle(schema, metadata.schemas.core, operation, direction);
    if (direction.toLowerCase() === `output`) {
        if (outputValidator.getSchema(schema.$id)) {
            console.warn(
                `Output schema with $id ${schema.$id} for ${metadata.collectionName} already existed, skipping`
            );
        } else {
            outputValidator.addSchema(schema);
        }
    } else {
        if (inputValidator.getSchema(schema.$id)) {
            console.warn(
                `Input schema with $id ${schema.$id} for ${metadata.collectionName} already existed, skipping`
            );
        } else {
            inputValidator.addSchema(schema);
        }
    }
};
