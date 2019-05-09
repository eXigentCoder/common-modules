'use strict';
//todo maybe validate the arguments using v8n
const _ = require('lodash');

module.exports = function setAndValidateId(schema, coreSchema, operation) {
    if (_.isNil(schema)) {
        throw new Error('schema is required');
    }
    if (_.isNil(coreSchema)) {
        throw new Error('coreSchema is required');
    }
    if (_.isNil(operation)) {
        throw new Error('operation is required');
    }
    if (_.isNil(coreSchema.$id)) {
        throw new Error('coreSchema must have a $id');
    }
    if (!coreSchema.$id.trim()) {
        throw new Error('coreSchema.$id cannot be blank');
    }
    if (schema.$id !== coreSchema.$id) {
        return;
    }
    if (_.endsWith(schema.$id, '/')) {
        schema.$id += operation;
    } else {
        schema.$id += '/' + operation;
    }
};
