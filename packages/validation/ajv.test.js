'use strict';

const { createOutputValidator, createValidator } = require('./ajv');
const { ValidationError } = require('../common-errors');
describe('Validation', () => {
    describe('Custom keywords in constructor', () => {
        it('should allow you to pass in custom keyword functions to the constructor', () => {
            const validator = createValidator({ allErrors: true }, someKeywordFn);
            const key = 'schemaWithKeyword';
            const schemaWithKeyword = {
                name: 'simple',
                additionalProperties: false,
                properties: {
                    answer: { type: 'string', SOMEKEYWORD: 'date' },
                },
            };
            validator.addSchema(schemaWithKeyword, key);
            const data = {
                answer: '2019-01-01',
            };
            validator.ensureValid(key, data);
            expect(data.answer).to.equal(42);

            function someKeywordFn(ajv) {
                ajv.addKeyword('SOMEKEYWORD', {
                    validate: (
                        keywordValue,
                        input,
                        schema,
                        currentDataPath,
                        parentDataObject,
                        propName
                    ) => {
                        parentDataObject[propName] = 42;
                        return true;
                    },
                });
            }
        });
    });
    describe('ensureValid', () => {
        it('should validate if adding a schema with an explicit key', () => {
            const key = 'someAwesomeSchema';
            const simpleSchema = {
                name: 'simple',
                additionalProperties: false,
                properties: {
                    integerValue: {
                        type: 'integer',
                    },
                },
            };
            const validator = createValidator({ allErrors: true });
            validator.addSchema(simpleSchema, key);
            validator.ensureValid(key, { integerValue: 3 });
        });
        it('should validate if adding a schema with an implicit key', () => {
            const key = 'someAwesomeSchema';
            const simpleSchema = {
                $id: key,
                name: 'simple',
                additionalProperties: false,
                properties: {
                    integerValue: {
                        type: 'integer',
                    },
                },
            };
            const validator = createValidator({ allErrors: true });
            validator.addSchema(simpleSchema);
            validator.ensureValid(key, { integerValue: 3 });
        });
        it("should throw a ValidationError if the data doesn't match the schema", () => {
            const key = 'someAwesomeSchema';
            const simpleSchema = {
                name: 'simple',
                additionalProperties: false,
                properties: {
                    integerValue: {
                        type: 'integer',
                    },
                },
                required: ['integerValue'],
            };
            const validator = createValidator({ allErrors: true });
            validator.addSchema(simpleSchema, key);
            expect(() => validator.ensureValid(key, {})).to.throw(ValidationError);
        });
    });
    describe('outputValidator', () => {
        it('Should validate an empty object against a simple JSON Schema', () => {
            const simpleSchema = {
                name: 'simple',
                additionalProperties: false,
                properties: {},
            };
            const validate = createOutputValidator().compile(simpleSchema);
            expect(validate({})).to.be.ok;
        });
        it('Should add default values', () => {
            const simpleSchema = {
                name: 'simple',
                additionalProperties: false,
                properties: {
                    iRABoolean: {
                        type: 'boolean',
                        default: true,
                    },
                },
            };
            const validate = createOutputValidator().compile(simpleSchema);
            const obj = {};
            expect(validate(obj)).to.be.ok;
            expect(validate(obj.iRABoolean)).to.equal(true);
        });
        it('Should filter out extra properties', () => {
            const simpleSchema = {
                name: 'simple',
                additionalProperties: false,
                properties: {},
            };
            const validate = createOutputValidator().compile(simpleSchema);
            const obj = {
                a: 'b',
            };
            expect(validate(obj)).to.be.ok;
            expect(obj.a).to.not.be.ok;
        });
        it('Should not coerce types if possible', () => {
            const simpleSchema = {
                name: 'simple',
                additionalProperties: false,
                properties: {
                    a: { type: 'integer' },
                    b: { type: 'string' },
                },
            };
            const validate = createOutputValidator().compile(simpleSchema);
            const obj = {
                a: '1',
                b: '1',
            };
            expect(validate(obj)).to.be.ok;
            expect(obj.a).to.equal(1);
            expect(obj.b).to.equal('1');
        });
        describe('addSchema', () => {
            it('should throw an error if you try add two of', () => {
                const simpleSchema = {
                    $id: 'bob',
                    name: 'simple',
                    additionalProperties: false,
                    properties: {},
                };
                const outputValidator = createOutputValidator();
                outputValidator.addSchema(simpleSchema);
                expect(() => outputValidator.addSchema(simpleSchema)).to.throw('already exists');
            });
            it('should allow you to validate against an added schema', () => {
                const simpleSchema = {
                    $id: 'bobby',
                    name: 'simple',
                    additionalProperties: false,
                    properties: {
                        name: {
                            type: 'string',
                        },
                    },
                    required: ['name'],
                };
                const outputValidator = createOutputValidator();
                outputValidator.addSchema(simpleSchema);
                const inValidObject = {};
                expect(outputValidator.validate(simpleSchema.$id, inValidObject)).to.not.be.ok;
                const validObject = { name: 'bob' };
                expect(outputValidator.validate(simpleSchema.$id, validObject)).to.be.ok;
            });
        });
    });
});
