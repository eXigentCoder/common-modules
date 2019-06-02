'use strict';
const IsRequiredError = require('../is-required-error/is-required-error');
const TenantError = require('./tenant-error');
const KrimZenNinjaBaseError = require('../krimzen-ninja-base-error');

describe('Common Errors', () => {
    describe('EntityNotFoundError', () => {
        it('should throw an error if no arguments provided', () => {
            //@ts-ignore
            expect(() => new TenantError()).to.throw(IsRequiredError);
        });
        it('should be an instance of the Error class', () => {
            const error = new TenantError('Team');
            expect(error).to.be.instanceOf(KrimZenNinjaBaseError);
        });
        it('should have the correct name', function() {
            const error = new TenantError('Team');
            expect(error.name).to.equal(TenantError.name);
        });
        it('should have an error code for localisation', function() {
            const error = new TenantError('Team');
            expect(error.code).to.be.ok;
        });
        it('should have a stack', function() {
            const error = new TenantError('Team');
            expect(error.stack).to.be.ok;
        });
        it('should have a message', function() {
            const error = new TenantError('Team');
            expect(error.message).to.be.ok;
        });
    });
});
