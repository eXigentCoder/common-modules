'use strict';

/** @returns {import('@bit/exigentcoder.common-modules.entity-metadata/entity-metadata/types').JsonSchema} */
function core() {
    return {
        title: 'todo',
        description: 'A to-do item that should be completed',
        type: 'object',
        additionalProperties: false,
        properties: {
            description: {
                type: 'string',
            },
            title: {
                type: 'string',
            },
        },
        required: ['description', 'title'],
        errorMessage: {
            type: 'should be an object',
            required: {
                description: 'Must have "description" specified',
                title: 'Must have "title" specified',
            },
            properties: {
                description: 'description must be a string',
                title: 'title must be a string',
            },
        },
    };
}

module.exports = {
    core,
};
