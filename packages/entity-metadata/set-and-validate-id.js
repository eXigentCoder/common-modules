'use strict';

const isNil = require('lodash/isNil');
const endsWith = require('lodash/endsWith');

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').JsonSchema} coreSchema
 * @param {string} operation
 * @returns {void}
 */
module.exports = function setAndValidateId(schema, coreSchema, operation) {
    if (isNil(schema)) {
        throw new Error('schema is required');
    }
    if (isNil(coreSchema)) {
        throw new Error('coreSchema is required');
    }
    if (isNil(operation)) {
        throw new Error('operation is required');
    }
    if (isNil(coreSchema.$id)) {
        throw new Error('coreSchema must have a $id');
    }
    if (!coreSchema.$id.trim()) {
        throw new Error('coreSchema.$id cannot be blank');
    }
    schema.$id = schema.$id || coreSchema.$id;
    if (schema.$id !== coreSchema.$id) {
        return;
    }
    if (endsWith(schema.$id, '/')) {
        schema.$id += operation;
    } else {
        schema.$id += '/' + operation;
    }
};
