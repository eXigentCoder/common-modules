'use strict';

const removeFromArrayIfExists = require('./remove-from-array-if-exists');

module.exports = function filterPropertiesForReplace(schema) {
    if (!schema) {
        throw new Error('Schema is a required field');
    }
    delete schema.properties._id;
    removeFromArrayIfExists(schema.required, '_id');
    delete schema.properties.status;
    removeFromArrayIfExists(schema.required, 'status');
    delete schema.properties.statusDate;
    removeFromArrayIfExists(schema.required, 'statusDate');
    delete schema.properties.statusLog;
    removeFromArrayIfExists(schema.required, 'statusLog');
    delete schema.properties.owner;
    removeFromArrayIfExists(schema.required, 'owner');
    delete schema.properties.ownerDate;
    removeFromArrayIfExists(schema.required, 'ownerDate');
    delete schema.properties.ownerLog;
    removeFromArrayIfExists(schema.required, 'ownerLog');
};
