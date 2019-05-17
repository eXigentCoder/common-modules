'use strict';

const removeFromArrayIfExists = require('./remove-from-array-if-exists');

/**
 * @param {Object} schema
 * @param {import('./').DomainMetadata} metadata
 */
module.exports = function filterPropertiesForCreation(schema, metadata) {
    if (!schema) {
        throw new Error('Schema is a required field');
    }
    delete schema.properties[metadata.identifier.name];
    removeFromArrayIfExists(schema.required, metadata.identifier.name);

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
