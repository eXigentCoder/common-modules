'use strict';

const { removeSchemaAndRequired, removeFromRequired } = require(`./json-schema-utilities`);

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').EntityMetadata} metadata
 */
module.exports = function filterPropertiesForReplace(schema, metadata) {
    if (!schema) {
        throw new Error(`Schema is a required field`);
    }
    removeFromRequired(schema, ``, `versionInfo`);
    removeSchemaAndRequired(schema, metadata.identifier.pathToId);
    // delete schema.properties.status;
    // removeFromArrayIfExists(schema.required, 'status');
    // delete schema.properties.statusDate;
    // removeFromArrayIfExists(schema.required, 'statusDate');
    // delete schema.properties.statusLog;
    // removeFromArrayIfExists(schema.required, 'statusLog');
    // delete schema.properties.owner;
    // removeFromArrayIfExists(schema.required, 'owner');
    // delete schema.properties.ownerDate;
    // removeFromArrayIfExists(schema.required, 'ownerDate');
    // delete schema.properties.ownerLog;
    // removeFromArrayIfExists(schema.required, 'ownerLog');
};
