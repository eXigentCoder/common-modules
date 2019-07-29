'use strict';

const commonSchemas = require('@bit/exigentcoder.common-modules.json-schema');

/** @returns {import('@bit/exigentcoder.common-modules.entity-metadata/entity-metadata/types').JsonSchema} */
function core() {
    return {
        title: 'organisation',
        description:
            'An organisation that contains the people and other entities within the system',
        type: 'object',
        additionalProperties: false,
        properties: {
            title: commonSchemas.title,
        },
        required: ['title'],
        errorMessage: {
            type: 'should be an object',
            required: {
                title: 'Must have "title" specified',
            },
            properties: {
                title:
                    'title must be an alpha numeric value with no whitespace or special characters of at least 1 character',
            },
        },
    };
}

module.exports = {
    core,
};
