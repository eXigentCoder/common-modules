'use strict';
const commonSchemas = require(`.`);

const { createInputValidator } = require(`../validation/ajv`);
describe(`JSON Schemas`, () => {
    describe(`dates and times`, function() {
        describe(`DateTime`, () => {
            const validator = createInputValidator();
            const validate = validator.compile(commonSchemas.dateTime);
            it(`should not allow null`, function() {
                const dateVal = null;
                expect(validate(dateVal)).to.not.be.ok;
            });
            it(`should not allow an empty string`, function() {
                const dateVal = ``;
                expect(validate(dateVal)).to.not.be.ok;
            });
            it(`should not allow a non empty string that is not a date`, function() {
                const dateVal = `asd`;
                expect(validate(dateVal)).to.not.be.ok;
            });
            it(`should allow an ISOString`, function() {
                const dateString = new Date().toISOString();
                expect(validate(dateString)).to.be.ok;
            });
            it(`should allow a valid date object`, () => {
                const date = new Date(`2019-06-10T12:05:46.202Z`);
                expect(validate(date)).to.be.ok;
            });
            it(`should not allow an object which isn't a date`, function() {
                const dateVal = {};
                expect(validate(dateVal)).to.not.be.ok;
            });
        });

        describe(`Date`, function() {
            const validator = createInputValidator();
            const validate = validator.compile(commonSchemas.date);
            it(`should not allow null`, function() {
                const dateString = null;
                expect(validate(dateString)).to.not.be.ok;
            });
            it(`should not allow an empty string`, function() {
                const dateString = ``;
                expect(validate(dateString)).to.not.be.ok;
            });
            it(`should not allow a non empty string that is not a date`, function() {
                const dateString = `asd`;
                expect(validate(dateString)).to.not.be.ok;
            });
            it(`should allow an YYYY-MM-DD date`, function() {
                expect(validate(`2019-01-02`)).to.be.ok;
            });
        });

        describe(`Time`, function() {
            const validator = createInputValidator();
            const validate = validator.compile(commonSchemas.time);
            it(`should not allow null`, function() {
                const dateString = null;
                expect(validate(dateString)).to.not.be.ok;
            });
            it(`should not allow an empty string`, function() {
                const dateString = ``;
                expect(validate(dateString)).to.not.be.ok;
            });
            it(`should not allow a non empty string that is not a date`, function() {
                const dateString = `asd`;
                expect(validate(dateString)).to.not.be.ok;
            });
            it(`should allow an hh:mm:ss string`, function() {
                expect(validate(`17:53:00`)).to.be.ok;
            });
            it(`should allow an hh:mm:ss.sss string`, function() {
                expect(validate(`17:53:00.000`)).to.be.ok;
            });
            it(`should allow an hh:mm:ss.sss string with timezone offset`, function() {
                expect(validate(`17:53:00.000+02:00`)).to.be.ok;
            });
            it(`should allow an hh:mm:ss.sss string with UTC timezone`, function() {
                expect(validate(`17:53:00.000Z`)).to.be.ok;
            });
        });
    });
});
