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
module.exports = generateDomainMetadata;
/**
 *
 * @typedef {{name:string,description?:string,type:string, additionalProperties?:boolean, properties?:{[key: string]: { prop: Schema }}, required?:string[], $id?:string}} Schema
 * @typedef {{schemas:{core:Schema, output?:Schema, create?:Schema, replace?:Schema}, name?:string, namePlural?:string, title?:string, titlePlural?:string, aOrAn?:string, identifierName?:string, collectionName?:string, trackHistory:boolean, indexes?:object[]}} DomainMetadata
 * @param {DomainMetadata | object} metadata
 * @param {import('../validation/ajv').Validator} inputValidator
 * @param {import('../validation/ajv').Validator} outputValidator
 * @returns {DomainMetadata}
 */
function generateDomainMetadata(metadata, inputValidator, outputValidator) {
    validate(metadata, inputValidator);
    metadata.schemas = JSON.parse(JSON.stringify(metadata.schemas));
    inferNames(metadata);
    setAOrAn(metadata);
    metadata.schemas.core.$id =
        metadata.schemas.core.$id || generateId(metadata.baseUrl, metadata.collectionName);
    Object.getOwnPropertyNames(metadata.schemas).forEach(function(key) {
        hydrateSchema(metadata.schemas[key], metadata);
    });
    ensureSchemaSet(metadata, 'output', 'Output', outputValidator, inputValidator);
    filterPropertiesForOutput(metadata.schemas.output);
    ensureSchemaSet(metadata, 'create', 'Input', outputValidator, inputValidator);
    filterPropertiesForCreation(metadata.schemas.create);
    ensureSchemaSet(metadata, 'replace', 'Input', outputValidator, inputValidator);
    filterPropertiesForReplace(metadata.schemas.replace);
    return metadata;
}

/**
 * @param {DomainMetadata} metadata
 * @param {import('../validation/ajv').Validator} validator
 */
function validate(metadata, validator) {
    const metadataSchema = getMetadataSchema();
    if (!validator.getSchema(metadataSchema.$id)) {
        validator.addSchema(metadataSchema);
    }
    validator.ensureValid(metadataSchema.$id, metadata);
}

/** @param {DomainMetadata} metadata */
function setAOrAn(metadata) {
    metadata.aOrAn = 'A';
    if (vowels.indexOf(metadata.name[0]) >= 0) {
        metadata.aOrAn = 'An';
    }
}
