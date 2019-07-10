'use strict';

const { removeFromRequired, removeFromRequiredForEntityPath } = require(`./json-schema-utilities`);

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').EntityMetadata} metadata
 */
module.exports = function filterPropertiesForReplace(schema, metadata) {
    if (!schema) {
        throw new Error(`Schema is a required field`);
    }
    removeFromRequired(schema, ``, `versionInfo`);
    removeFromRequiredForEntityPath(schema, metadata.identifier.pathToId);
    if (metadata.authorization && metadata.authorization.ownership) {
        removeFromRequired(schema, ``, `owner`);
    }
    // delete schema.properties.status;
    // removeFromArrayIfExists(schema.required, 'status');
    // delete schema.properties.statusDate;
    // removeFromArrayIfExists(schema.required, 'statusDate');
    // delete schema.properties.statusLog;
    // removeFromArrayIfExists(schema.required, 'statusLog');
};
