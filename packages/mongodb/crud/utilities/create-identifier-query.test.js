'use strict';
const generateEntityMetadata = require(`../../../entity-metadata`);
const { createInputValidator, createOutputValidator } = require(`../../../validation`);
const { addMongoId } = require(`../../../validation-mongodb`);
const { createGetIdentifierQuery } = require(`./create-identifier-query`);
const ObjectId = require(`mongodb`).ObjectId;
const { ValidationError } = require(`../../../common-errors`);
const { noStringIdNoTenant, stringIdNoTenant } = require(`../../test-utilities`);
describe(`MongoDB`, () => {
    describe(`createGetIdentifierQuery`, () => {
        describe(`no string identifer`, () => {
            const inputValidator = createInputValidator(addMongoId);
            const outputValidator = createOutputValidator(addMongoId);
            const inputMetadata = noStringIdNoTenant();
            const metadata = generateEntityMetadata(inputMetadata, inputValidator, outputValidator);
            const getIdentifierQuery = createGetIdentifierQuery(metadata);
            it(`should throw an error if no id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery()).to.throw(ValidationError);
            });
            it(`should throw an error if null id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery(null)).to.throw(ValidationError);
            });
            it(`should throw an error if undefined id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery(undefined)).to.throw(ValidationError);
            });
            it(`should throw an error if a non-ObjectId object id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery({})).to.throw(ValidationError);
            });
            it(`should throw an error if a number id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery(1)).to.throw(ValidationError);
            });
            it(`should be able to handle a mongodb ObjectId object`, () => {
                const id = new ObjectId();
                const query = getIdentifierQuery(id);
                expect(query).to.eql({ _id: id });
            });
            it(`should be able to handle a mongodb ObjectId string`, () => {
                const id = new ObjectId();
                const query = getIdentifierQuery(id.toString());
                expect(query).to.eql({ _id: id });
            });
            it(`should throw an error if the string value is not an object id`, () => {
                expect(() => getIdentifierQuery(`bob`)).to.throw(ValidationError);
            });
        });
        describe(`has a string identifer`, () => {
            const inputValidator = createInputValidator(addMongoId);
            const outputValidator = createOutputValidator(addMongoId);
            const inputMetadata = stringIdNoTenant();
            const metadata = generateEntityMetadata(inputMetadata, inputValidator, outputValidator);
            const getIdentifierQuery = createGetIdentifierQuery(metadata);
            it(`should throw an error if no id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery()).to.throw(ValidationError);
            });
            it(`should throw an error if null id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery(null)).to.throw(ValidationError);
            });
            it(`should throw an error if undefined id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery(undefined)).to.throw(ValidationError);
            });
            it(`should throw an error if a non-ObjectId object id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery({})).to.throw(ValidationError);
            });
            it(`should throw an error if a number id provided`, () => {
                // @ts-ignore
                expect(() => getIdentifierQuery(1)).to.throw(ValidationError);
            });
            it(`should be able to handle a mongodb ObjectId object`, () => {
                const id = new ObjectId();
                const query = getIdentifierQuery(id);
                expect(query).to.eql({ _id: id });
            });
            it(`should be able to handle a mongodb ObjectId string`, () => {
                const id = new ObjectId();
                const query = getIdentifierQuery(id.toString());
                expect(query).to.eql({ _id: id });
            });
            it(`should be able to handle a non ObjectId string`, () => {
                const query = getIdentifierQuery(`bob`);
                expect(query).to.eql({ name: `bob` });
            });
        });
    });
});
