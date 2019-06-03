'use strict';

const _ = require('lodash');

/**
 * @typedef {import('./types').JsonSchema} JsonSchema
 */
//todo rk probably need to move this to the other lib

/**
 * @param {string} entityPath The path as it would appear on an entity which conforms to the schema.
 * @returns {string} The path on the schema
 */
function getSchemaPathFromEntityPath(entityPath = '') {
    if (!entityPath) {
        return '';
    }
    return entityPath.includes('.')
        ? `properties.${entityPath.split('.').join('.properties.')}`
        : `properties.${entityPath}`;
}

/**
 * Takes in a path to a schema and works out where to put the relevant required fields
 * @param {string} schemaPath The path to the point on the schema
 * @returns {string} The path to the relevant required array on the schema
 */
function getRequiredPathFromSchemaPath(schemaPath = '') {
    if (!schemaPath) {
        return 'required';
    }
    if (schemaPath.endsWith('properties')) {
        return `${removeLastNNodesOnPath(schemaPath, 1)}.required`;
    }
    return `${schemaPath}.required`;
}

/**
 * @param {string} path The path containing the nodes
 * @param {number} numberOfNodesToRemove the number of nodes to remove
 * @returns {string} The new path with the last node removed
 */
function removeLastNNodesOnPath(path, numberOfNodesToRemove) {
    const parts = path.split('.');
    return parts.splice(0, parts.length - numberOfNodesToRemove).join('.');
}

/**
 * @param {string} path The path containing the nodes
 * @returns {string} The last node on the path
 */
function getLastNodeOnPath(path) {
    const parts = path.split('.');
    return parts.splice(parts.length - 1, 1)[0];
}

/**
 * Gets the JSON Schema at the properties path
 * @param {*} schema The schema to work with
 * @param {*} entityPath That path to the schema as it would appear on an entity that conforms to the overall schema
 * @returns
 */
function getSchemaForEntityPath(schema, entityPath) {
    const schemaPath = getSchemaPathFromEntityPath(entityPath);
    return _.get(schema, schemaPath);
}

/**
 * Sets a JSON schema at the provided path as it would appear on an entity
 * @param {JsonSchema} schema The schema to work with
 * @param {string} entityPathh That path indicating where the schema belongs, as it would appear on an entity that conforms to the overall schema
 * @param {JsonSchema} value The JSON Schema to set at the property path
 * @returns
 */
function setSchemaForEntityPath(schema, entityPathh, value) {
    const schemaPath = getSchemaPathFromEntityPath(entityPathh);
    return _.set(schema, schemaPath, value);
}

/**
 * Removes the schema at the specified path
 * @param {JsonSchema} schema The schema to work with
 * @param {string} entityPath That path indicating where the schema belongs, as it would appear on an entity that conforms to the overall schema
 */
function deleteSchemaForEntityPath(schema, entityPath) {
    const schemaPath = getSchemaPathFromEntityPath(entityPath);
    const fieldNameToDelete = getLastNodeOnPath(schemaPath);
    const pathPartsExcludingId = removeLastNNodesOnPath(schemaPath, 1);
    const obj = _.get(schema, pathPartsExcludingId);
    delete obj[fieldNameToDelete];
}

/**
 * Takes in an entity path and gets the required fields array for it.
 * @param {JsonSchema} schema The schema to work with
 * @param {string} entityPath The path to the required fields as it would appear on the entity
 * @returns {string[]|false} The required fields array
 */
function getRequiredForEntityPath(schema, entityPath) {
    const schemaPath = getSchemaPathFromEntityPath(entityPath);
    const requiredPath = getRequiredPathFromSchemaPath(schemaPath);
    // @ts-ignore
    return _.get(schema, requiredPath, []);
}

/**
 * Takes in an entity path and sets the required fields array for it to the provided value.
 * @param {JsonSchema} schema The schema to work with
 * @param {string} entityPath The path to the required fields as it would appear on the entity
 * @param {string[]|false} value The required fields array to set
 * @returns {void}
 */
function setRequiredForEntityPath(schema, entityPath, value) {
    const schemaPath = getSchemaPathFromEntityPath(entityPath);
    const requiredPath = getRequiredPathFromSchemaPath(schemaPath);
    _.set(schema, requiredPath, value);
}

/**
 * Takes in an entity path and adds the required field(s)
 * @param {JsonSchema} schema The schema to work with
 * @param {string} entityPath The path to the required fields as it would appear on the entity
 * @param {string[]|string} value The required fields array to set
 * @returns {void}
 */
function addToRequiredForEntityPath(schema, entityPath, value) {
    const schemaPath = getSchemaPathFromEntityPath(entityPath);
    const requiredPath = getRequiredPathFromSchemaPath(schemaPath);
    /** @type {string[]} */
    // @ts-ignore
    let array = _.get(schema, requiredPath, []);
    if (!array) {
        //catering for the case where required was set to false
        array = [];
    }
    if (Array.isArray(value)) {
        array = array.concat(value);
    } else {
        array.push(value);
    }
    array = _.uniq(array);
    _.set(schema, requiredPath, array);
}

/**
 * Takes in an entity path and removes the required field(s) from it
 * @param {JsonSchema} schema The schema to work with
 * @param {string} entityPath The path to the required fields as it would appear on the entity
 * @param {string[]|string} value The required fields array to set
 * @returns {void}
 */
function removeFromRequiredForEntityPath(schema, entityPath, value) {
    const schemaPath = getSchemaPathFromEntityPath(entityPath);
    const requiredPath = getRequiredPathFromSchemaPath(schemaPath);
    /** @type {string[]} */
    // @ts-ignore
    let array = _.get(schema, requiredPath, []);
    if (!array) {
        //catering for the case where required was set to false
        array = [];
    }
    value = Array.isArray(value) ? value : [value];
    value.forEach(val => removeFromArrayIfExists(array, val));
    array = _.uniq(array);
    _.set(schema, requiredPath, array);
}

/**
 * Walks along the schema path, making sure that all the nodes along the path are required
 * @param {JsonSchema} schema The schema to work with
 * @param {string} entityPath That path indicating all the nested nodes (separated by a `.`) that should be marked as required
 */
function markFullPathAsRequiredForEntityPath(schema, entityPath) {
    const schemaPath = getSchemaPathFromEntityPath(entityPath);
    const pathParts = schemaPath.split('.').reverse();
    let partialEntityPath = '';
    while (pathParts.length !== 0) {
        const part = pathParts.pop();
        if (part !== 'properties') {
            addToRequiredForEntityPath(schema, partialEntityPath, part);
            partialEntityPath = partialEntityPath ? `${partialEntityPath}.${part}` : part;
        }
    }
}

/**
 * Removes the property at the specified path
 * @param {object} entity The entity to work with
 * @param {string} path That path indicating which property to remove
 */
function removePropertyFromEntity(entity, path) {
    const fieldNameToDelete = getLastNodeOnPath(path);
    const pathPartsExcludingId = removeLastNNodesOnPath(path, 1);
    const obj = pathPartsExcludingId ? _.get(entity, pathPartsExcludingId) : entity;
    delete obj[fieldNameToDelete];
}

/**
 * @param {string[]} array The array to remove the item from
 * @param {string} item the item to search for
 * @returns {void}
 */
function removeFromArrayIfExists(array, item) {
    if (!array) {
        return;
    }
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
}
/**
 * Ensures that the provided schema has properties and required array at the base level
 * @param {JsonSchema} schema
 */
function ensurePropsAndRequired(schema) {
    schema.properties = schema.properties || {};
    schema.required = schema.required || [];
}

/**
 * Removes the required field and any schema associated with at the specified path
 * @param {JsonSchema} schema
 * @param {string} path
 */
function removeSchemaAndRequired(schema, path) {
    const tenantFieldName = getLastNodeOnPath(path);
    const pathExcludingId = removeLastNNodesOnPath(path, 1);
    removeFromRequiredForEntityPath(schema, pathExcludingId, tenantFieldName);
    deleteSchemaForEntityPath(schema, path);
}

/**
 * Adds the provided fieldSchema to the baseSchema at the specified path as a required field
 * @param {JsonSchema} baseSchema
 * @param {string} path
 * @param {JsonSchema} fieldSchema
 */
function addRequiredSchema(baseSchema, path, fieldSchema) {
    const alreadyHasASchema = getSchemaForEntityPath(baseSchema, path);
    if (alreadyHasASchema) {
        markFullPathAsRequiredForEntityPath(baseSchema, path);
        return;
    }
    setSchemaForEntityPath(baseSchema, path, fieldSchema);
    markFullPathAsRequiredForEntityPath(baseSchema, path);
}

module.exports = {
    //path translation
    getSchemaPathFromEntityPath,
    getRequiredPathFromSchemaPath,
    //string node pathing related
    removeLastNNodesOnPath,
    getLastNodeOnPath,
    //schema related related
    getSchemaForEntityPath,
    setSchemaForEntityPath,
    deleteSchemaForEntityPath,
    //required field array related
    getRequiredForEntityPath,
    setRequiredForEntityPath,
    addToRequiredForEntityPath,
    removeFromRequiredForEntityPath,
    //entity related
    removePropertyFromEntity,

    markFullPathAsRequiredForEntityPath,

    ensurePropsAndRequired,

    removeFromArrayIfExists,

    removeSchemaAndRequired,
    addRequiredSchema,
};
