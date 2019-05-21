'use strict';

const isNil = require('lodash/isNil');
const upperFirst = require('lodash/upperFirst');

module.exports = function setAndValidateName(schema, coreSchema, operation, direction) {
    if (isNil(schema)) {
        throw new Error('schema is required');
    }
    if (isNil(coreSchema)) {
        throw new Error('coreSchema is required');
    }
    if (isNil(operation)) {
        throw new Error('operation is required');
    }
    if (isNil(direction)) {
        throw new Error('direction is required');
    }
    if (isNil(coreSchema.name)) {
        throw new Error('coreSchema must have a name');
    }
    if (!coreSchema.name.trim()) {
        throw new Error('coreSchema.name cannot be blank');
    }
    if (schema.name !== coreSchema.name) {
        return;
    }
    operation = upperFirst(operation);
    if (operation === direction) {
        schema.name += direction;
        return;
    }
    schema.name += upperFirst(operation) + direction;
};
