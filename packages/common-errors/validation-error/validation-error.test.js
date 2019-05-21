'use strict';

const ValidationError = require('./validation-error');
const { IsRequiredError } = require('..');
describe('Common Errors', () => {
    describe('ValidationError', () => {
        it('should throw an error if no arguments provided', () => {
            //@ts-ignore
            expect(() => new ValidationError()).to.throw(IsRequiredError);
        });
        it('should be an instance of the Error class', () => {
            const error = new ValidationError('test');
            expect(error).to.be.instanceOf(Error);
        });
        it('should have the correct name', function() {
            const error = new ValidationError('test');
            expect(error.name).to.equal(ValidationError.name);
        });
        it('should have an error code for localisation', function() {
            const error = new ValidationError('test');
            expect(error.code).to.be.ok;
        });
        it('should have a stack', function() {
            const error = new ValidationError('test');
            expect(error.stack).to.be.ok;
        });
        it('should have a message', function() {
            const error = new ValidationError('test');
            expect(error.message).to.be.ok;
        });
        it('should allow you to specify the extra errors', function() {
            const error = new ValidationError('test', [{ error: 'lol1' }, { error: 'lol2' }]);
            expect(error.errors).to.be.ok;
        });
    });
});
