'use strict';

const setAndValidateId = require('./set-and-validate-id');

const operation = 'Test';

describe('Entity Metadata', () => {
    describe('setAndValidateId', () => {
        it('should throw an error if no schema provided', () => {
            expect(() => setAndValidateId()).to.throw('schema is required');
        });
        it('should throw an error if no core schema provided', () => {
            expect(() => setAndValidateId({})).to.throw('coreSchema is required');
        });
        it('should throw an error if no operation provided', () => {
            expect(() => setAndValidateId({}, {})).to.throw('operation is required');
        });
        it('should throw an error if core schema has no $id', () => {
            const coreSchema = {};
            expect(() => setAndValidateId({}, coreSchema, operation)).to.throw(
                'coreSchema must have a $id'
            );
        });
        it('should throw an error if core schema has a blank $id', () => {
            const coreSchema = {
                $id: ' ',
            };
            expect(() => setAndValidateId({}, coreSchema, operation)).to.throw(
                'coreSchema.$id cannot be blank'
            );
        });
        it('should return successfully if both schemas have different ids', () => {
            const schema = {
                $id: 'jack',
            };
            const coreSchema = {
                $id: 'bob',
            };
            setAndValidateId(schema, coreSchema, operation);
            expect(schema.$id).not.to.equal(coreSchema.$id);
        });
        it('should rename the schema id if they are both the same', () => {
            const schema = {
                $id: 'bob',
            };
            const coreSchema = {
                $id: 'bob',
            };
            setAndValidateId(schema, coreSchema, operation);
            expect(schema.$id).not.to.equal(coreSchema.$id);
            expect(coreSchema.$id).to.equal('bob');
        });
        it('should join the id and the operation using a "/"', () => {
            const schema = {
                $id: 'bob',
            };
            const coreSchema = {
                $id: 'bob',
            };
            setAndValidateId(schema, coreSchema, operation);
            expect(schema.$id.indexOf('/')).to.be.greaterThan(0);
        });
        it('should not contain an addtitional / if the schema already had one ', () => {
            const schema = {
                $id: 'bob/',
            };
            const coreSchema = {
                $id: 'bob/',
            };
            setAndValidateId(schema, coreSchema, operation);
            expect(schema.$id.indexOf('//')).to.be.lessThan(0);
        });
    });
});
