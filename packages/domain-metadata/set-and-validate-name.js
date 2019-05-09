'use strict';
//todo maybe validate the arguments using v8n
const _ = require('lodash');

module.exports = function setAndValidateName(schema, coreSchema, operation, direction) {
    if (_.isNil(schema)) {
        throw new Error('schema is required');
    }
    if (_.isNil(coreSchema)) {
        throw new Error('coreSchema is required');
    }
    if (_.isNil(operation)) {
        throw new Error('operation is required');
    }
    if (_.isNil(direction)) {
        throw new Error('direction is required');
    }
    if (_.isNil(coreSchema.name)) {
        throw new Error('coreSchema must have a name');
    }
    if (!coreSchema.name.trim()) {
        throw new Error('coreSchema.name cannot be blank');
    }
    if (schema.name !== coreSchema.name) {
        return;
    }
    operation = _.upperFirst(operation);
    if (operation === direction) {
        schema.name += direction;
        return;
    }
    schema.name += _.upperFirst(operation) + direction;
};
