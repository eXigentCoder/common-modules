'use strict';
const v8n = require(`v8n`);
const url = require(`url`);
const baseUrlValidator = v8n()
    .string()
    .pattern(/^http(s?):\/\//)
    .minLength(10);
const collectionNameValidator = v8n()
    .string()
    .minLength(1);

function generateId(baseUrl, collectionName) {
    baseUrlValidator.check(baseUrl);
    collectionNameValidator.check(collectionName);
    return new url.URL(collectionName, baseUrl).toString();
}

function createGenerator(baseUrl) {
    baseUrlValidator.check(baseUrl);
    return function(collectionName) {
        return generateId(baseUrl, collectionName);
    };
}

module.exports = { generateId, createGenerator };
