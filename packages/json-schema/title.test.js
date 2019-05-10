'use strict';

const commonSchemas = require('./');
const { createInputValidator } = require('../validation/ajv');

describe('JSON Schemas - title', function() {
    const schema = commonSchemas.title;
    const validate = createInputValidator().compile(schema);
    it('should not allow blank titles', function() {
        const title = '';
        expect(validate(title)).to.not.be.ok;
    });
    it('should allow space character', function() {
        const title = ' ';
        expect(validate(title)).to.be.ok;
    });
    it('should not allow tab character', function() {
        const title = '\t';
        expect(validate(title)).to.not.be.ok;
    });
    it('should not allow newline character', function() {
        const title = '\n';
        expect(validate(title)).to.not.be.ok;
    });
    it('should not allow carriage return character', function() {
        const title = '\r';
        expect(validate(title)).to.not.be.ok;
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
