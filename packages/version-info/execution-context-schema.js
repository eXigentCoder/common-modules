'use strict';

const commonSchemas = require('../json-schema');
const generateId = require('../json-schema/common-module-schema-id-generator');
const identitySchema = require('./identity-schema');

module.exports = {
    $id: generateId('versionInfo/context'),
    name: 'The execution context that will be used to alter the object and stored in versionInfo',
    description: 'context about the function that was called',
    type: 'object',
    additionalProperties: false,
    properties: {
        requestId: commonSchemas.nonEmptyString,
        identity: identitySchema,
        sourceIp: commonSchemas.ipV4,
        codeVersion: commonSchemas.nonEmptyString,
    },
    required: ['requestId', 'identity', 'codeVersion'],
};
