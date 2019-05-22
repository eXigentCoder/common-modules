'use strict';
const IsRequiredError = require('./entity-not-found-error');

describe('Common Errors', () => {
    describe('IsRequiredError', () => {
        it('should throw an error if no arguments provided', () => {
            //@ts-ignore
            expect(() => new IsRequiredError()).to.throw(IsRequiredError);
        });
        it('should be an instance of the Error class', () => {
            const error = new IsRequiredError('test');
            expect(error).to.be.instanceOf(Error);
        });
        it('should have the correct name', function() {
            const error = new IsRequiredError('test');
            expect(error.name).to.equal(IsRequiredError.name);
        });
        it('should have an error code for localisation', function() {
            const error = new IsRequiredError('test');
            expect(error.code).to.be.ok;
        });
        it('should have a stack', function() {
            const error = new IsRequiredError('test');
            expect(error.stack).to.be.ok;
        });
        it('should have a message', function() {
            const error = new IsRequiredError('test');
            expect(error.message).to.be.ok;
        });
        it('should allow you to specify the function name', function() {
            const error = new IsRequiredError('test', 'mochaTests');
            expect(error.message).to.be.ok;
        });
    });
});
