'use strict';

const commonSchemas = require(`.`);
const { createInputValidator } = require(`../validation/ajv`);

describe(`JSON Schemas`, () => {
    describe(`Email`, function() {
        const validator = createInputValidator();
        const validate = validator.compile(commonSchemas.oneOrMoreEmailAddresses);

        it(`should not allow blank emails`, function() {
            const email = ``;
            expect(validate(email)).to.not.be.ok;
        });
        it(`should not allow just @ and .`, function() {
            const email = `@.`;
            expect(validate(email)).to.not.be.ok;
        });
        it(`Should pass for at least some text, an @ symbol, some more test, a "."and some more text`, function() {
            const email = `a@b.c`;
            expect(validate(email)).to.be.ok;
        });
    });
});
