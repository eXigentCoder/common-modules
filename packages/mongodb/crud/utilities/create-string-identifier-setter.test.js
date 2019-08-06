'use strict';

const { createStringIdentifierSetter } = require(`./create-string-identifier-setter`);
const { noStringIdNoTenant, stringIdNoTenant } = require(`../../test-utilities`);
const { titleToStringIdentifier } = require(`./title-to-string-identifier`);
describe(`MongoDB`, () => {
    describe(`createStringIdentifierSetter`, () => {
        it(`should not alter the object if there is no string identifier`, () => {
            const setStringIdentifier = createStringIdentifierSetter(
                noStringIdNoTenant(),
                titleToStringIdentifier
            );
            const entity = {};
            setStringIdentifier(entity);
            expect(entity).to.eql({});
        });
        it(`should set the string identifier if one is defined in the metadata`, () => {
            const setStringIdentifier = createStringIdentifierSetter(
                stringIdNoTenant(),
                titleToStringIdentifier
            );
            const entity = {
                username: `Bob bobson`,
            };
            setStringIdentifier(entity);
            expect(entity).to.eql({ username: `Bob bobson`, name: `bob-bobson` });
        });
        it(`should throw an error if a string identifier is defined in the metadata but the source is blank`, () => {
            const setStringIdentifier = createStringIdentifierSetter(
                stringIdNoTenant(),
                titleToStringIdentifier
            );
            const entity = {};
            expect(() => setStringIdentifier(entity)).to.throw();
        });
    });
});
