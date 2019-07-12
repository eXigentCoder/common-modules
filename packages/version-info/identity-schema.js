'use strict';

const commonSchemas = require(`../json-schema/index`);
const generateId = require(`../json-schema/common-module-schema-id-generator`);

module.exports = {
    $id: generateId(`versionInfo/identity`),
    name: `identity`,
    description: `Represents the identify of an entity (human or machine) which can access the system`,
    type: `object`,
    additionalProperties: true,
    properties: {
        id: commonSchemas.nonEmptyString,
    },
    required: [`id`],
};
