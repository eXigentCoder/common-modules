'use strict';
const commonSchemas = require(`../json-schema/index`);
const generateId = require(`../json-schema/common-module-schema-id-generator`);
const identitySchema = require(`./identity-schema`);

module.exports = {
    $id: generateId(`versionInfo`),
    name: `versionInfo`,
    description: `Information about the most recent changes to this object and it's creation info`,
    type: `object`,
    additionalProperties: false,
    properties: {
        dateCreated: commonSchemas.dateTime,
        versionTag: commonSchemas.uuid,
        dateUpdated: commonSchemas.dateTime,
        createdBy: identitySchema,
        lastUpdatedBy: identitySchema,
        updatedByRequestId: commonSchemas.nonEmptyString,
        createdInVersion: commonSchemas.nonEmptyString,
        updatedInVersion: commonSchemas.nonEmptyString,
    },
    required: [
        `dateCreated`,
        `versionTag`,
        `dateUpdated`,
        `createdBy`,
        `lastUpdatedBy`,
        `updatedByRequestId`,
        `createdInVersion`,
        `updatedInVersion`,
    ],
};
