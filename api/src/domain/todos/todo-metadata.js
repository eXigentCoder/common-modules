'use strict';

const generateEntityMetadata = require(`@bit/exigentcoder.common-modules.entity-metadata`);
const {
    inputValidator,
    outputValidator,
} = require(`../../validation/validators`);
const { core } = require(`./todo-schemas`);
const {
    jsonSchemas,
} = require(`@bit/exigentcoder.common-modules.validation-mongodb`);
const { identifier } = require(`@bit/exigentcoder.common-modules.json-schema`);
let _metadata;

/**
 * @returns {import('@bit/exigentcoder.common-modules.entity-metadata/types').EntityMetadata}
 */
module.exports = function getMetadata() {
    if (_metadata) {
        return _metadata;
    }
    _metadata = generateEntityMetadata(
        {
            baseUrl: `https://www.google.com`,
            identifier: {
                pathToId: `_id`,
                schema: jsonSchemas.mongoDbObjectId(),
            },
            stringIdentifier: {
                pathToId: `identifier`,
                schema: identifier,
                entitySourcePath: `title`,
            },
            collectionName: `todos`,
            schemas: {
                core: core(),
            },
            statuses: [
                {
                    pathToStatusField: `status`,
                    allowedValues: [
                        {
                            name: `Todo`,
                            description: `An item that still needs to be done`,
                        },
                        {
                            name: `In Progress`,
                            description: `An item that is currently being worked on`,
                        },
                        {
                            name: `Done`,
                            description: `An item that is completed`,
                        },
                    ],
                },
            ],
        },
        inputValidator,
        outputValidator
    );
    return _metadata;
};
