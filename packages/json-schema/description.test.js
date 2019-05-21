'use strict';

const commonSchemas = require('.');
const { createInputValidator } = require('../validation/ajv');
describe('JSON Schemas', () => {
    describe('description', function() {
        const validator = createInputValidator();
        const validate = validator.compile(commonSchemas.description);
        it('should allow blank descriptions', function() {
            const description = '';
            expect(validate(description)).to.be.ok;
        });
        it('should allow space character', function() {
            const description = ' ';
            expect(validate(description)).to.be.ok;
        });
        it('should allow tab character', function() {
            const description = '\t';
            expect(validate(description)).to.be.ok;
        });
        it('should allow newline character', function() {
            const description = '\n';
            expect(validate(description)).to.be.ok;
        });
        it('should allow carriage return character', function() {
            const description = '\r';
            expect(validate(description)).to.be.ok;
        });
        it('should lowercase allow letters', function() {
            const description = 'a';
            expect(validate(description)).to.be.ok;
        });
        it('should uppercase allow letters', function() {
            const description = 'A';
            expect(validate(description)).to.be.ok;
        });
        it('should uppercase allow numbers', function() {
            const description = '1';
            expect(validate(description)).to.be.ok;
        });
        it('should uppercase allow dash', function() {
            const description = '-';
            expect(validate(description)).to.be.ok;
        });
    });
});
