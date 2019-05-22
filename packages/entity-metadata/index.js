'use strict';

const inferNames = require('./infer-names');
const vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
const ensureSchemaSet = require('./ensure-schema-set');
const hydrateSchema = require('./hydrate-schema');
const filterPropertiesForOutput = require('./filter-properties-for-output');
const filterPropertiesForCreation = require('./filter-properties-for-creation');
const filterPropertiesForReplace = require('./filter-properties-for-update');
const { generateId } = require('../json-schema/schema-id-generator');
const getMetadataSchema = require('./metadata-schema');
const defaultTitleToStringIdentifierFn = require('./title-to-string-identifier');
module.exports = generateEntityMetadata;
/**
 *
 * @typedef {Object} Schema
 * @property {string} [$id]
 * @property {string} name
 * @property {string} [description]
 * @property {string|string[]} type
 * @property {boolean} [additionalProperties]
 * @property {{[key: string]: Schema|SubSchema}} properties
 * @property {string[]} [required]
 *
 * @typedef {Object} SubSchema
 * @property {string} [name]
 * @property {string} [description]
 * @property {string|string[]} type
 * @property {boolean} [additionalProperties]
 * @property {{[key: string]: SubSchema}} [properties]
 * @property {string[]} [required]
 *
 *
 * @typedef {Object} EntityMetadata
 * @property {Object} schemas
 * @property {Schema} schemas.core
 * @property {Schema} [schemas.output]
 * @property {Schema} [schemas.create]
 * @property {Schema} [schemas.replace]
 * @property {string} [name] Either set or comes from the core schema
 * @property {string} [namePlural]
 * @property {string} [title]
 * @property {string} [titlePlural]
 * @property {string} [aOrAn]
 * @property {Object} identifier
 * @property {string} identifier.name
 * @property {Object} identifier.schema
 * @property {Object} [stringIdentifier]
 * @property {string} stringIdentifier.name
 * @property {Object} stringIdentifier.schema
 * @property {Object} [stringIdentifier.source]
 * @property {string} collectionName
 * @property {string} baseUrl
 * @property {(title:string)=>string} [titleToStringIdentifier]
 *
 * @param {EntityMetadata|Object} metadata
 * @param {import('../validation/ajv').Validator} inputValidator
 * @param {import('../validation/ajv').Validator} outputValidator
 * @returns {EntityMetadata}
 */
function generateEntityMetadata(metadata, inputValidator, outputValidator) {
    validate(metadata, inputValidator);
    metadata.titleToStringIdentifier =
        metadata.titleToStringIdentifier || defaultTitleToStringIdentifierFn;
    metadata.schemas = JSON.parse(JSON.stringify(metadata.schemas));
    inferNames(metadata);
    setAOrAn(metadata);
    metadata.schemas.core.$id =
        metadata.schemas.core.$id || generateId(metadata.baseUrl, metadata.collectionName);
    ensureSchemaSet(metadata, 'output', 'Output', outputValidator, inputValidator);
    ensureSchemaSet(metadata, 'create', 'Input', outputValidator, inputValidator);
    ensureSchemaSet(metadata, 'replace', 'Input', outputValidator, inputValidator);
    Object.getOwnPropertyNames(metadata.schemas).forEach(function(key) {
        hydrateSchema(metadata.schemas[key], metadata);
    });
    filterPropertiesForOutput(metadata.schemas.output);
    filterPropertiesForCreation(metadata.schemas.create, metadata);
    filterPropertiesForReplace(metadata.schemas.replace, metadata);
    return metadata;
}

/**
 * @param {EntityMetadata} metadata
 * @param {import('../validation/ajv').Validator} validator
 */
function validate(metadata, validator) {
    const metadataSchema = getMetadataSchema();
    if (!validator.getSchema(metadataSchema.$id)) {
        validator.addSchema(metadataSchema);
    }
    validator.ensureValid(metadataSchema.$id, metadata);
}

/** @param {EntityMetadata} metadata */
function setAOrAn(metadata) {
    metadata.aOrAn = 'A';
    if (vowels.indexOf(metadata.name[0]) >= 0) {
        metadata.aOrAn = 'An';
    }
}
