'use strict';

const KrimZenNinjaBaseError = require('./krimzen-ninja-base-error');
const crypto = require('crypto');

describe('Common Errors', () => {
    describe('KrimZen Ninja Base Error', () => {
        function minValidParams() {
            return {
                message: `test - ${crypto.randomBytes(20).toString('hex')}`,
                name: 'KrimZenNinjaBaseError',
                codeSuffix: 'BASE',
            };
        }
        it('Should throw an error if no params object provided', () => {
            // @ts-ignore
            expect(() => new KrimZenNinjaBaseError()).to.throw();
        });

        it('Should throw an error if empty params object provided', () => {
            // @ts-ignore
            expect(() => new KrimZenNinjaBaseError({})).to.throw();
        });

        it('Should throw an error if no message param provided', () => {
            const params = minValidParams();
            delete params.message;
            // @ts-ignore
            expect(() => new KrimZenNinjaBaseError(params)).to.throw();
        });

        it('Should throw an error if no name param provided', () => {
            const params = minValidParams();
            delete params.name;
            // @ts-ignore
            expect(() => new KrimZenNinjaBaseError(params)).to.throw();
        });

        it('Should throw an error if no codeSuffix param provided', () => {
            const params = minValidParams();
            delete params.codeSuffix;
            // @ts-ignore
            expect(() => new KrimZenNinjaBaseError(params)).to.throw();
        });

        it('Should be creatable if all 3 required parms are there', () => {
            const err = new KrimZenNinjaBaseError(minValidParams());
            expect(err).to.be.ok;
            expect(err.message).to.be.ok;
            expect(err.name).to.be.ok;
            expect(err.code).to.be.ok;
            expect(err.stack).to.be.ok;
            expect(err.innerError).to.not.be.ok;
            expect(err.safeToShowToUsers).to.equal(false);
            expect(err.httpStatusCode).to.equal(500);
        });
        describe('toString', () => {
            const params = minValidParams();
            const secondLevelInnerErr = new KrimZenNinjaBaseError(minValidParams());
            const innerError = new KrimZenNinjaBaseError({
                ...minValidParams(),
                innerError: secondLevelInnerErr,
            });
            params.innerError = innerError;
            params.decorate = { someValue: true, aNumber: 42 };
            params.safeToShowToUsers = true;
            params.httpStatusCode = 418;
            const err = new KrimZenNinjaBaseError(params);
            it('should include the name', () => {
                expect(err.toString()).to.containIgnoreSpaces(params.name);
            });
            it('should include the message', () => {
                expect(err.toString()).to.containIgnoreSpaces(params.message);
            });
            it('should include the innerError message', () => {
                expect(err.toString()).to.containIgnoreSpaces(innerError.message);
            });
            it("should include the innerError's innerError's message", () => {
                expect(err.toString()).to.containIgnoreSpaces(secondLevelInnerErr.message);
            });
            it('should include the decorate params', () => {
                expect(err.toString()).to.containIgnoreSpaces('aNumber');
            });
        });
    });
});
