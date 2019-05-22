'use strict';
const IsRequiredError = require('../is-required-error/is-required-error');
const EntityNotFoundError = require('./entity-not-found-error');
const KrimZenNinjaBaseError = require('../krimzen-ninja-base-error');

describe('Common Errors', () => {
    describe('EntityNotFoundError', () => {
        it('should throw an error if no arguments provided', () => {
            //@ts-ignore
            expect(() => new EntityNotFoundError()).to.throw(IsRequiredError);
        });
        it('should be an instance of the Error class', () => {
            const error = new EntityNotFoundError('User', '1');
            expect(error).to.be.instanceOf(KrimZenNinjaBaseError);
        });
        it('should have the correct name', function() {
            const error = new EntityNotFoundError('User', '1');
            expect(error.name).to.equal(EntityNotFoundError.name);
        });
        it('should have an error code for localisation', function() {
            const error = new EntityNotFoundError('User', '1');
            expect(error.code).to.be.ok;
        });
        it('should have a stack', function() {
            const error = new EntityNotFoundError('User', '1');
            expect(error.stack).to.be.ok;
        });
        it('should have a message', function() {
            const error = new EntityNotFoundError('User', '1');
            expect(error.message).to.be.ok;
        });
    });
});
