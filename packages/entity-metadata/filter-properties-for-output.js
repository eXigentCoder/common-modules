'use strict';

const { removeFromArrayIfExists } = require(`./json-schema-utilities`);
const _ = require(`lodash`);
const withVersionInfo = require(`../version-info/with-version-info`);

/** @param {import('./types').JsonSchema} schema */
module.exports = function filterPropertiesForOutput(schema) {
    clearProperties(schema);
    _.merge(schema, withVersionInfo());
    if (schema.definitions) {
        Object.getOwnPropertyNames(schema.definitions).forEach(function(definitionName) {
            clearProperties(schema.definitions[definitionName]);
        });
    }
};

/** @param {import('./types').JsonSchema} schema */
function clearProperties(schema) {
    Object.getOwnPropertyNames(schema.properties).forEach(function(propertyName) {
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
