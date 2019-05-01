'use strict';

const commonSchemas = require('./');
const { createInputValidator } = require('../validation/ajv');
var chai = require('chai');
var expect = chai.expect;

describe('JSON Schemas - name', function() {
    const schema = commonSchemas.name;
    const validator = createInputValidator();
    const validate = validator.compile(schema);
    it('should not allow blank names', function() {
        const name = '';
        expect(validate(name)).to.not.be.ok;
    });
    it('should not allow space character', function() {
        const name = '  ';
        expect(validate(name)).to.not.be.ok;
    });
    it('should not allow tab character', function() {
        const name = '\t';
        expect(validate(name)).to.not.be.ok;
    });
    it('should not allow newline character', function() {
        const name = '\n';
        expect(validate(name)).to.not.be.ok;
    });
    it('should not allow carriage return character', function() {
        const name = '\r';
        expect(validate(name)).to.not.be.ok;
    });
    it('should lowercase allow letters', function() {
        const name = 'a';
        expect(validate(name)).to.be.ok;
    });
    it('should uppercase allow letters', function() {
        const name = 'A';
        expect(validate(name)).to.be.ok;
    });
    it('should uppercase allow numbers', function() {
        const name = '1';
        expect(validate(name)).to.be.ok;
    });
    it('should uppercase allow dash', function() {
        const name = '-';
        expect(validate(name)).to.be.ok;
    });
});
