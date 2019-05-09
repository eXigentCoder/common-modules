'use strict';

const setAndValidateName = require('./set-and-validate-name');
var chai = require('chai');
var expect = chai.expect;
const operation = 'Test';
const direction = 'Output';

describe('[Unit] setAndValidateName', () => {
    it('should throw an error if no schema provided', () => {
        expect(() => setAndValidateName()).to.throw('schema is required');
    });
    it('should throw an error if no core schema provided', () => {
        expect(() => setAndValidateName({})).to.throw('coreSchema is required');
    });
    it('should throw an error if no operation provided', () => {
        expect(() => setAndValidateName({}, {})).to.throw('operation is required');
    });
    it('should throw an error if no direction provided', () => {
        expect(() => setAndValidateName({}, {}, operation)).to.throw('direction is required');
    });
    it('should throw an error if core schema has no name', () => {
        const coreSchema = {};
        expect(() => setAndValidateName({}, coreSchema, operation, direction)).to.throw(
            'coreSchema must have a name'
        );
    });
    it('should throw an error if core schema has no name', () => {
        const coreSchema = {
            name: '  ',
        };
        expect(() => setAndValidateName({}, coreSchema, operation, direction)).to.throw(
            'coreSchema.name cannot be blank'
        );
    });
    it('should return successfully if both schemas have different names', () => {
        const schema = {
            name: 'jack',
        };
        const coreSchema = {
            name: 'bob',
        };
        setAndValidateName(schema, coreSchema, operation, direction);
        expect(schema.name).not.to.equal(coreSchema.name);
    });
    it('should append the operation and direction to the name if the schema.name and coreSchema.name are the same', () => {
        const schema = {
            name: 'bob',
        };
        const coreSchema = {
            name: 'bob',
        };
        setAndValidateName(schema, coreSchema, operation, direction);
        expect(schema.name.toLowerCase().indexOf(operation.toLowerCase())).to.be.greaterThan(0);
        expect(schema.name.toLowerCase().indexOf(direction.toLowerCase())).to.be.greaterThan(0);
    });
    it('should append the operation and direction to the name only once if the schema.name and coreSchema.name are the same and the operation and direction are the same', () => {
        const schema = {
            name: 'bob',
        };
        const coreSchema = {
            name: 'bob',
        };
        const lowerCaseDirection = direction.toLowerCase();
        setAndValidateName(schema, coreSchema, direction, direction);
        expect(schema.name.toLowerCase().indexOf(lowerCaseDirection)).to.be.greaterThan(0);
        expect(
            schema.name.toLowerCase().indexOf(lowerCaseDirection + lowerCaseDirection)
        ).to.be.lessThan(0);
    });
});
