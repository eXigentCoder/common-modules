'use strict';

const { titleToStringIdentifier } = require(`./title-to-string-identifier`);

describe(`MongoDB`, () => {
    describe(`title-to-string-identifier`, () => {
        it(`should throw an error for null`, () => {
            expect(() => titleToStringIdentifier(null)).to.throw();
        });
        it(`should throw an error for undefined`, () => {
            expect(() => titleToStringIdentifier(undefined)).to.throw();
        });
        it(`should throw an error for blank`, () => {
            expect(() => titleToStringIdentifier(``)).to.throw();
        });
        it(`should throw an error for whitespace only`, () => {
            expect(() => titleToStringIdentifier(` \t\r\n`)).to.throw();
        });
        it(`should throw an error for numbers`, () => {
            // @ts-ignore
            expect(() => titleToStringIdentifier(1)).to.throw();
        });
        it(`should throw an error for objects`, () => {
            // @ts-ignore
            expect(() => titleToStringIdentifier({})).to.throw();
        });
        it(`should kebab case a string`, () => {
            expect(titleToStringIdentifier(` \r\n\tZOMG asd pew_pew-K\r\n\t `)).to.equal(
                `zomg-asd-pew-pew-k`
            );
        });
    });
});
