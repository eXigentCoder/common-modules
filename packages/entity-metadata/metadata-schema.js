'use strict';

const commonSchemas = require(`../json-schema`);
const generateId = require(`../json-schema/common-module-schema-id-generator`);
//const jsonSchema = require('ajv/lib/refs/json-schema-draft-07.json');

const objectSchema = {
    type: `object`,
    properties: {},
    additionalProperties: true,
};

//todo rk, duplication here between typescript and JSON schema, need to generate the TS
module.exports = function() {
    return {
        $id: generateId(`metadata`),
        name: `metadata`,
        type: `object`,
        additionalProperties: false,
        properties: {
            schemas: {
                type: `object`,
                additionalProperties: true,
                properties: {
                    core: objectSchema,
                    create: objectSchema,
                    output: objectSchema,
                    replace: objectSchema,
                },
                required: [`core`],
            },
            identifier: {
                type: `object`,
                additionalProperties: false,
                properties: {
                    pathToId: {
                        type: `string`,
                    },
                    schema: {
                        type: `object`,
                    },
                },
                required: [`pathToId`, `schema`],
            },
            stringIdentifier: {
                type: `object`,
                additionalProperties: false,
                properties: {
                    pathToId: {
                        type: `string`,
                    },
                    schema: {
                        type: `object`,
                    },
                    entitySourcePath: {
                        type: `string`,
                    },
                },
                required: [`pathToId`, `schema`],
            },
            tenantInfo: {
                type: `object`,
                additionalProperties: false,
                properties: {
                    entityPathToId: {
                        type: `string`,
                    },
                    executionContextSourcePath: {
                        type: `string`,
                    },
                    title: {
                        type: `string`,
                    },
                    schema: {
                        type: `object`,
                    },
                },
                required: [`entityPathToId`, `executionContextSourcePath`, `title`, `schema`],
            },
            collectionName: commonSchemas.identifier,
            auditCollectionName: commonSchemas.identifier,
            auditChanges: commonSchemas.boolean,
            baseUrl: commonSchemas.url,
            aOrAn: {
                type: `string`,
                enum: [`An`, `A`],
            },
            name: commonSchemas.identifier,
            namePlural: commonSchemas.identifier,
            title: commonSchemas.title,
            titlePlural: commonSchemas.title,
        },
        required: [`schemas`, `identifier`, `collectionName`, `baseUrl`],
    };
};
