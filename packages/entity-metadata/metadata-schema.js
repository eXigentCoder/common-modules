'use strict';

const commonSchemas = require(`../json-schema`);
const generateId = require(`../json-schema/common-module-schema-id-generator`);
//const jsonSchema = require(`ajv/lib/refs/json-schema-draft-07.json`);

/** @returns {import("./types").JsonSchema} */
module.exports = function() {
    return {
        $id: generateId(`metadata`),
        title: `Entity Metadata`,
        type: `object`,
        additionalProperties: false,
        properties: {
            schemas: {
                type: `object`,
                additionalProperties: true,
                properties: {
                    core: { $ref: `#/definitions/jsonSchema` },
                    create: { $ref: `#/definitions/jsonSchema` },
                    output: { $ref: `#/definitions/jsonSchema` },
                    replace: { $ref: `#/definitions/jsonSchema` },
                },
                required: [`core`],
            },
            identifier: { $ref: `#/definitions/identifier` },
            stringIdentifier: { $ref: `#/definitions/stringIdentifier` },
            tenantInfo: { $ref: `#/definitions/tenantInfo` },
            authorization: { $ref: `#/definitions/authorization` },
            statuses: {
                type: `array`,
                items: { $ref: `#/definitions/statusFieldDefinition` },
                uniqueItems: true,
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
        definitions: {
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
            ownership: {
                type: `object`,
                properties: {
                    initialOwner: {
                        type: `string`,
                        enum: [`creator`, `setFromEntity`, `setFromContext`],
                        default: `creator`,
                    },
                    pathToId: {
                        type: `string`,
                    },
                    allowedActions: {
                        type: `array`,
                        items: {
                            type: `string`,
                        },
                        uniqueItems: true,
                    },
                    idSchema: { $ref: `#/definitions/jsonSchema` },
                },
                additionalProperties: false,
                required: [`initialOwner`, `allowedActions`],
            },
            authorization: {
                type: `object`,
                additionalProperties: false,
                properties: {
                    policies: {
                        type: `array`,
                        items: {
                            type: `array`,
                            items: { type: `string`, additionalItems: false },
                        },
                        uniqueItems: true,
                    },
                    groups: {
                        type: `array`,
                        items: {
                            type: `array`,
                            items: { type: `string`, additionalItems: false },
                        },
                        uniqueItems: true,
                    },
                    ownership: { $ref: `#/definitions/ownership` },
                    interaction: {
                        type: `string`,
                        enum: [`or`, `and`],
                        default: `or`,
                    },
                },
                required: [`interaction`],
            },
            status: {
                type: `object`,
                properties: {
                    name: { type: `string` },
                    description: { type: `string` },
                },
                additionalProperties: false,
                required: [`name`],
            },
            statusFieldDefinition: {
                type: `object`,
                properties: {
                    pathToStatusField: { type: `string` },
                    allowedValues: {
                        type: `array`,
                        items: { $ref: `#/definitions/status` },
                        uniqueItems: true,
                    },
                    isRequired: { type: `boolean` },
                },
                required: [`pathToStatusField`, `allowedValues`, `isRequired`],
                additionalProperties: false,
            },
            jsonSchema: {
                type: `object`,
                properties: {},
                additionalProperties: true,
            },
        },
    };
};
