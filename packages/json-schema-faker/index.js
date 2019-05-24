'use strict';

const jsf = require('json-schema-faker');
const ObjectId = require('mongodb').ObjectId;
const faker = require('faker');

jsf.extend('faker', () => {
    // @ts-ignore
    faker.custom = {
        mongoId: () => {
            return new ObjectId().toString();
        },
    };
    return faker;
});

jsf.format('mongoId', () => {
    return new ObjectId().toString();
});

module.exports = jsf;
