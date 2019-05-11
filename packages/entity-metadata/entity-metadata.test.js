'use strict';
require('./test-init');
//todo rename all the stuff in there to be Entity instead of domain.
const generateEntityMetadata = require('./index');
const { createInputValidator, createOutputValidator } = require('../validation/ajv');
const { addMongoId, jsonSchemas } = require('../validation-mongodb/index');
const { ValidationError } = require('../common-errors');

describe('Generate Entity Metadata', () => {
    const inputValidator = createInputValidator(addMongoId);
    const outputValidator = createOutputValidator(addMongoId);
    function validMetaData() {
        return {
            schemas: {
                core: {
                    name: 'user',
                    properties: {
                        username: {
                            type: 'string',
                        },
                    },
                },
            },
            identifier: { name: 'id', schema: { type: 'string' } },
            collectionName: 'users',
            baseUrl: 'https://ryankotzen.com',
        };
    }
    it('should throw an error if no arguments', () => {
        // @ts-ignore
        expect(() => generateEntityMetadata()).to.throw();
    });
    it('should throw an error if no metadata', () => {
        expect(() => generateEntityMetadata(null, inputValidator, outputValidator)).to.throw();
    });
    it('should throw an error if metadata is an empty object', () => {
        expect(() => generateEntityMetadata({}, inputValidator, outputValidator)).to.throw();
    });
    it('should throw an error if metadata is missing the identifier property', () => {
        const inputMetadata = validMetaData();
        delete inputMetadata.identifier;
        expect(() =>
            generateEntityMetadata(inputMetadata, inputValidator, outputValidator)
        ).to.throw(ValidationError);
    });
    it('should throw an error if metadata.identifier is missing the name property', () => {
        const inputMetadata = validMetaData();
        delete inputMetadata.identifier.name;
        expect(() =>
            generateEntityMetadata(inputMetadata, inputValidator, outputValidator)
        ).to.throw(ValidationError);
    });
    it('should throw an error if metadata.identifier is missing the schema property', () => {
        const inputMetadata = validMetaData();
        delete inputMetadata.identifier.schema;
        expect(() =>
            generateEntityMetadata(inputMetadata, inputValidator, outputValidator)
        ).to.throw(ValidationError);
    });
    it('should throw an error if metadata is missing the schemas property', () => {
        const inputMetadata = validMetaData();
        delete inputMetadata.schemas;
        expect(() =>
            generateEntityMetadata(inputMetadata, inputValidator, outputValidator)
        ).to.throw(ValidationError);
    });
    it('should throw an error if metadata.schemas is missing the core property', () => {
        const inputMetadata = validMetaData();
        delete inputMetadata.schemas.core;
        expect(() =>
            generateEntityMetadata(inputMetadata, inputValidator, outputValidator)
        ).to.throw(ValidationError);
    });
    it('should throw an error if metadata.schemas.core is missing the name property', () => {
        const inputMetadata = validMetaData();
        delete inputMetadata.schemas.core.name;
        expect(() =>
            generateEntityMetadata(inputMetadata, inputValidator, outputValidator)
        ).to.throw(ValidationError);
    });
    it('should not throw an error if provided with valid arguments', () => {
        expect(() =>
            generateEntityMetadata(validMetaData(), inputValidator, outputValidator)
        ).to.not.throw();
    });
    it('should work for a very basic metadat input', () => {
        const inputMetadata = validMetaData();

        const metadata = generateEntityMetadata(inputMetadata, inputValidator, outputValidator);
        expect(metadata).to.be.ok;
        expect(metadata.schemas.core.$id).to.be.ok;
    });
    it('should add $id to non core schemas', () => {
        const inputMetadata = validMetaData();
        inputMetadata.schemas.create = {
            name: 'user',
            properties: {
                username: {
                    type: 'string',
                },
            },
        };
        const inputValidator = createInputValidator(addMongoId);
        const outputValidator = createOutputValidator(addMongoId);
        const metadata = generateEntityMetadata(inputMetadata, inputValidator, outputValidator);
        expect(metadata).to.be.ok;
        expect(metadata.schemas.create.$id).to.be.ok;
    });
    it('Create schemas should not containe the identifier', () => {
        const inputMetadata = validMetaData();
        inputMetadata.schemas.create = {
            name: 'user',
            properties: {
                username: {
                    type: 'string',
                },
            },
        };
        const inputValidator = createInputValidator(addMongoId);
        const outputValidator = createOutputValidator(addMongoId);
        const metadata = generateEntityMetadata(inputMetadata, inputValidator, outputValidator);
        expect(metadata).to.be.ok;
        expect(metadata.schemas.create.properties[inputMetadata.identifier.name]).to.not.be.ok;
        expect(metadata.schemas.create.required).to.not.include(inputMetadata.identifier.name);
    });
});
