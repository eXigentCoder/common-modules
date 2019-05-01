'use strict';

const commonSchemas = require('./');
const { createInputValidator } = require('../validation/ajv');
var chai = require('chai');
var expect = chai.expect;

describe('JSON Schemas - title', function() {
    const validator = createInputValidator();
    const validate = validator.compile(commonSchemas.description);
    it('should allow blank titles', function() {
        const title = '';
        expect(validate(title)).to.be.ok;
    });
    it('should allow space character', function() {
        const title = ' ';
        expect(validate(title)).to.be.ok;
    });
    it('should allow tab character', function() {
        const title = '\t';
        expect(validate(title)).to.be.ok;
    });
    it('should allow newline character', function() {
        const title = '\n';
        expect(validate(title)).to.be.ok;
    });
    it('should allow carriage return character', function() {
        const title = '\r';
        expect(validate(title)).to.be.ok;
    });
    it('should lowercase allow letters', function() {
        const title = 'a';
        expect(validate(title)).to.be.ok;
    });
    it('should uppercase allow letters', function() {
        const title = 'A';
        expect(validate(title)).to.be.ok;
    });
    it('should uppercase allow numbers', function() {
        const title = '1';
        expect(validate(title)).to.be.ok;
    });
    it('should uppercase allow dash', function() {
        const title = '-';
        expect(validate(title)).to.be.ok;
    });
});
