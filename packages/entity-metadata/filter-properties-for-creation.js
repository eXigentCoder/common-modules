'use strict';

const { removeSchemaAndRequired } = require(`./json-schema-utilities`);

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').EntityMetadata} metadata
 */
module.exports = function filterPropertiesForCreation(schema, metadata) {
    if (!schema) {
        throw new Error(`Schema is a required field`);
    }
    removeSchemaAndRequired(schema, `versionInfo`);
    removeSchemaAndRequired(schema, metadata.identifier.pathToId);
    if (metadata.tenantInfo) {
        removeSchemaAndRequired(schema, metadata.tenantInfo.entityPathToId);
    }
    if (metadata.authorization && metadata.authorization.ownership) {
        removeSchemaAndRequired(schema, `owner`);
    }
};
