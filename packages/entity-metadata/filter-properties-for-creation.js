'use strict';

const { removeSchemaAndRequired, removeFromRequired } = require(`./json-schema-utilities`);

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
    if (metadata.statuses && metadata.statuses.length > 0) {
        for (const definition of metadata.statuses) {
            removeFromRequired(schema, ``, definition.pathToStatusField);
            removeSchemaAndRequired(schema, `${definition.pathToStatusField}Date`);
            removeSchemaAndRequired(schema, `${definition.pathToStatusField}Log`);
        }
    }
};
