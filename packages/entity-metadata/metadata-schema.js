'use strict';

const commonSchemas = require('../json-schema');
const generateId = require('../json-schema/common-module-schema-id-generator');

const objectSchema = {
    type: 'object',
    properties: {
        name: commonSchemas.identifier,
    },
    additionalProperties: true,
    required: ['name'],
};

module.exports = function() {
    return {
        $id: generateId('metadata'),
        name: 'metadata',
        type: 'object',
        additionalProperties: false,
        properties: {
            schemas: {
                type: 'object',
                additionalProperties: true,
                properties: {
                    core: objectSchema,
                    create: objectSchema,
                    output: objectSchema,
                    replace: objectSchema,
                },
                required: ['core'],
            },
            identifier: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    name: commonSchemas.identifier,
                    schema: {
                        type: 'object',
                    },
                },
                required: ['name', 'schema'],
            },
            stringIdentifier: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    name: {
                        type: 'string',
                    },
                    schema: {
                        type: 'object',
                    },
                    entitySourceLocation: {
                        type: 'string',
                    },
                },
                required: ['name', 'schema'],
            },
            tenantInfo: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    entityDestinationLocation: {
                        type: 'string',
                    },
                    executionContextSource: {
                        type: 'string',
                    },
                },
                required: ['entityDestinationLocation', 'executionContextSource'],
            },
            collectionName: commonSchemas.identifier,
            auditCollectionName: commonSchemas.identifier,
            auditChanges: commonSchemas.boolean,
            baseUrl: commonSchemas.url,
            aOrAn: {
                type: 'string',
                enum: ['An', 'A'],
            },
            name: commonSchemas.identifier,
            namePlural: commonSchemas.identifier,
            title: commonSchemas.title,
            titlePlural: commonSchemas.title,
        },
        required: ['schemas', 'identifier', 'collectionName', 'baseUrl'],
    };
};
