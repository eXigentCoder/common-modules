'use strict';

const NotAuthorizedError = require(`./not-authorized-error`);
const { IsRequiredError } = require(`..`);
describe(`Common Errors`, () => {
    describe(`NotAuthorizedError`, () => {
        it(`should throw an error if no arguments provided`, () => {
            //@ts-ignore
            expect(() => new NotAuthorizedError()).to.throw(IsRequiredError);
        });
        it(`should be an instance of the Error class`, () => {
            const error = new NotAuthorizedError(`bob`, `users`, `delete`);
            expect(error).to.be.instanceOf(Error);
        });
        it(`should have the correct name`, function() {
            const error = new NotAuthorizedError(`bob`, `users`, `delete`);
            expect(error.name).to.equal(NotAuthorizedError.name);
        });
        it(`should have an error code for localisation`, function() {
            const error = new NotAuthorizedError(`bob`, `users`, `delete`);
            expect(error.code).to.be.ok;
        });
        it(`should have a stack`, function() {
            const error = new NotAuthorizedError(`bob`, `users`, `delete`);
            expect(error.stack).to.be.ok;
        });
        it(`should have a message`, function() {
            const error = new NotAuthorizedError(`bob`, `users`, `delete`);
            expect(error.message).to.be.ok;
        });
    });
});
