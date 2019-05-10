'use strict';

const removeFromArrayIfExists = require('./remove-from-array-if-exists');
const withVersionInfo = require('../version-info/with-version-info');
const _ = require('lodash');
module.exports = function filterPropertiesForOutput(schema) {
    clearProperties(schema);
    _.merge(schema, withVersionInfo);
    if (schema.definitions) {
        Object.keys(schema.definitions).forEach(function(definitionName) {
            clearProperties(schema.definitions[definitionName]);
        });
    }
};

function clearProperties(schema) {
    Object.keys(schema.properties).forEach(function(propertyName) {
        const property = schema.properties[propertyName];
        if (property.excludeOnOutput === true) {
            delete schema.properties[propertyName];
            removeFromArrayIfExists(schema.required, propertyName);
            return;
        }
        if (property.properties) {
            clearProperties(property);
        }
    });
}
