'use strict';

const inferNames = require('./infer-names');
const vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
const _ = require('lodash');
const ensureSchemaSet = require('./ensure-schema-set');
const hydrateSchema = require('./hydrate-schema');
const filterPropertiesForOutput = require('./filter-properties-for-output');
const filterPropertiesForCreation = require('./filter-properties-for-creation');
const filterPropertiesForReplace = require('./filter-properties-for-update');
const { generateId } = require('../json-schema/schema-id-generator');
module.exports = generateDomainMetadata;
/**
 *
 * @typedef {{name:string,description?:string,type:string, additionalProperties?:boolean, properties?:{[key: string]: { prop: Schema }}, required?:string[], $id?:string, identifierName?:string}} Schema
 * @typedef {{schemas:{core:Schema, output?:Schema, create?:Schema, replace?:Schema}, name?:string, namePlural?:string, title?:string, titlePlural?:string, aOrAn?:string, identifierName?:string, collectionName?:string, trackHistory:boolean, indexes?:object[]}} DomainMetadata
 * @param {DomainMetadata | object} metadata
 * @returns {DomainMetadata}
 */
function generateDomainMetadata(metadata, inputValidator, outputValidator) {
    metadata.schemas = JSON.parse(JSON.stringify(metadata.schemas));
    validate(metadata);
    inferNames(metadata);
    setAOrAn(metadata);
    setIdentifierInfo(metadata);
    if (!metadata.schemas.core.$id) {
        //todo RK maybe there needs to be a service metadata and app metadata?
        metadata.schemas.core.$id = generateId(metadata.baseUrl, metadata.collectionName);
    }
    Object.keys(metadata.schemas).forEach(function(key) {
        hydrateSchema(metadata.schemas[key]);
    });
    ensureSchemaSet(metadata, 'output', 'Output', outputValidator, inputValidator);
    filterPropertiesForOutput(metadata.schemas.output);
    ensureSchemaSet(metadata, 'create', 'Input', outputValidator, inputValidator);
    filterPropertiesForCreation(metadata.schemas.create);
    ensureSchemaSet(metadata, 'replace', 'Input', outputValidator, inputValidator);
    filterPropertiesForReplace(metadata.schemas.replace);
    return metadata;
}

/** @param {DomainMetadata} metadata */
function validate(metadata) {
    if (_.isArray(metadata.schemas)) {
        throw new Error('metadata.schemas should not be an array.');
    }
    if (!_.isObject(metadata.schemas)) {
        throw new Error('metadata.schemas should be an object.');
    }
    if (!metadata.schemas.core) {
        throw new Error(
            'metadata.schemas.core is required, you can either set it directly or use the metadata.schema property.'
        );
    }
    if (!_.isObject(metadata.schemas.core)) {
        throw new Error('metadata.schemas.core must be an object');
    }
    if (!_.isString(metadata.schemas.core.name)) {
        throw new Error('metadata.schemas.core.name must be a string');
    }
    metadata.schemas.core.name = metadata.schemas.core.name.trim();
    if (!metadata.schemas.core.name) {
        throw new Error('metadata.schemas.core.name must be a non-empty string');
    }
}

/** @param {DomainMetadata} metadata */
function setAOrAn(metadata) {
    metadata.aOrAn = 'A';
    if (vowels.indexOf(metadata.name[0]) >= 0) {
        metadata.aOrAn = 'An';
    }
}

/** @param {DomainMetadata} metadata */
function setIdentifierInfo(metadata) {
    metadata.identifierName = metadata.identifierName || metadata.schemas.core.identifierName;
    if (!metadata.identifierName) {
        throw new Error('metadata.identifierName must be set');
    }
    metadata.collectionName = metadata.collectionName || metadata.namePlural;
}
