'use strict';

const isNil = require(`lodash/isNil`);
const upperFirst = require(`lodash/upperFirst`);

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').JsonSchema} coreSchema
 * @param {string} operation
 * @param {string} direction
 * @returns {void}
 */
module.exports = function setAndValidateName(schema, coreSchema, operation, direction) {
    if (isNil(schema)) {
        throw new Error(`schema is required`);
    }
    if (isNil(coreSchema)) {
        throw new Error(`coreSchema is required`);
    }
    if (isNil(operation)) {
        throw new Error(`operation is required`);
    }
    if (isNil(direction)) {
        throw new Error(`direction is required`);
    }
    if (isNil(coreSchema.title)) {
        throw new Error(`coreSchema must have a title`);
    }
    if (!coreSchema.title.trim()) {
        throw new Error(`coreSchema.title cannot be blank`);
    }
    if (schema.title !== coreSchema.title) {
        return;
    }
    operation = upperFirst(operation);
    if (operation === direction) {
        schema.title += direction;
        return;
    }
    schema.title += upperFirst(operation) + direction;
};
