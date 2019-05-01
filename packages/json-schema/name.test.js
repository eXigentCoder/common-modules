'use strict';

const commonSchemas = require('./');
const { createInputValidator } = require('../validation/ajv');
var chai = require('chai');
var expect = chai.expect;

describe('JSON Schemas - identifier', function() {
    const schema = commonSchemas.identifier;
    const validator = createInputValidator();
    const validate = validator.compile(schema);
    it('should not allow blank identifiers', function() {
        const identifier = '';
        expect(validate(identifier)).to.not.be.ok;
    });
    it('should not allow space character', function() {
        const identifier = '  ';
        expect(validate(identifier)).to.not.be.ok;
    });
    it('should not allow tab character', function() {
        const identifier = '\t';
        expect(validate(identifier)).to.not.be.ok;
    });
    it('should not allow newline character', function() {
        const identifier = '\n';
        expect(validate(identifier)).to.not.be.ok;
    });
    it('should not allow carriage return character', function() {
        const identifier = '\r';
        expect(validate(identifier)).to.not.be.ok;
    });
    it('should lowercase allow letters', function() {
        const identifier = 'a';
        expect(validate(identifier)).to.be.ok;
    });
    it('should uppercase allow letters', function() {
        const identifier = 'A';
        expect(validate(identifier)).to.be.ok;
    });
    it('should uppercase allow numbers', function() {
        const identifier = '1';
        expect(validate(identifier)).to.be.ok;
    });
    it('should uppercase allow dash', function() {
        const identifier = '-';
        expect(validate(identifier)).to.be.ok;
    });
});
