'use strict';

const setAndValidateTitle = require(`./set-and-validate-title`);

const operation = `Test`;
const direction = `Output`;

describe(`Entity Metadata`, () => {
    describe(`setAndValidateTitle`, () => {
        it(`should throw an error if no schema provided`, () => {
            // @ts-ignore
            expect(() => setAndValidateTitle()).to.throw(`schema is required`);
        });
        it(`should throw an error if no core schema provided`, () => {
            // @ts-ignore
            expect(() => setAndValidateTitle({})).to.throw(`coreSchema is required`);
        });
        it(`should throw an error if no operation provided`, () => {
            // @ts-ignore
            expect(() => setAndValidateTitle({}, {})).to.throw(`operation is required`);
        });
        it(`should throw an error if no direction provided`, () => {
            // @ts-ignore
            expect(() => setAndValidateTitle({}, {}, operation)).to.throw(`direction is required`);
        });
        it(`should throw an error if core schema has no title`, () => {
            const coreSchema = {};
            expect(() => setAndValidateTitle({}, coreSchema, operation, direction)).to.throw(
                `coreSchema must have a title`
            );
        });
        it(`should throw an error if core schema has no non whitespace title`, () => {
            const coreSchema = {
                title: `  `,
            };
            expect(() => setAndValidateTitle({}, coreSchema, operation, direction)).to.throw(
                `coreSchema.title cannot be blank`
            );
        });
        it(`should return successfully if both schemas have different titles`, () => {
            const schema = {
                title: `jack`,
            };
            const coreSchema = {
                title: `bob`,
            };
            setAndValidateTitle(schema, coreSchema, operation, direction);
            expect(schema.title).not.to.equal(coreSchema.title);
        });
        it(`should append the operation and direction to the title if the schema.title and coreSchema.title are the same`, () => {
            const schema = {
                title: `bob`,
            };
            const coreSchema = {
                title: `bob`,
            };
            setAndValidateTitle(schema, coreSchema, operation, direction);
            expect(schema.title.toLowerCase().indexOf(operation.toLowerCase())).to.be.greaterThan(
                0
            );
            expect(schema.title.toLowerCase().indexOf(direction.toLowerCase())).to.be.greaterThan(
                0
            );
        });
        it(`should append the operation and direction to the title only once if the schema.title and coreSchema.title are the same and the operation and direction are the same`, () => {
            const schema = {
                title: `bob`,
            };
            const coreSchema = {
                title: `bob`,
            };
            const lowerCaseDirection = direction.toLowerCase();
            setAndValidateTitle(schema, coreSchema, direction, direction);
            expect(schema.title.toLowerCase().indexOf(lowerCaseDirection)).to.be.greaterThan(0);
            expect(
                schema.title.toLowerCase().indexOf(lowerCaseDirection + lowerCaseDirection)
            ).to.be.lessThan(0);
        });
    });
});
