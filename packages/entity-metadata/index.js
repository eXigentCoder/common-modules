'use strict';

const inferNames = require('./infer-names');
const vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
const ensureSchemaSet = require('./ensure-schema-set');
const { hydrateSchema } = require('./hydrate-schema');
const filterPropertiesForOutput = require('./filter-properties-for-output');
const filterPropertiesForCreation = require('./filter-properties-for-creation');
const filterPropertiesForReplace = require('./filter-properties-for-replace');
const { generateId } = require('../json-schema/schema-id-generator');
const getMetadataSchema = require('./metadata-schema');
const defaultTitleToStringIdentifierFn = require('./title-to-string-identifier');

module.exports = generateEntityMetadata;
/**
 * @typedef {import('./types').EntityMetadata} EntityMetadata
 * @typedef {import('../validation/ajv').Validator} Validator
 *
 * @param {EntityMetadata} metadata
 * @param {Validator} inputValidator
 * @param {Validator} outputValidator
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
    metadata.auditCollectionName =
        metadata.auditCollectionName || metadata.collectionName + '-audit';
    if (metadata.auditChanges === undefined || metadata.auditChanges === null) {
        metadata.auditChanges = false;
    }
    Object.getOwnPropertyNames(metadata.schemas).forEach(function(key) {
        const schema = metadata.schemas[key];
        schema.title = schema.title || metadata.title;
    });
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
 * @param {Validator} validator
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
