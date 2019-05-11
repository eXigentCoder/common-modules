'use strict';

//todo rename all the stuff in there to be Entity instead of domain.
const generateEntityMetadata = require('./index');
const { createInputValidator, createOutputValidator } = require('../validation/ajv');

describe('Generate Entity Metadata', () => {
    it('should work for a very basic metadat input', () => {
        const inputMetadata = {
            schemas: {
                core: {
                    name: 'user',
                },
            },
            identifierName: '_id',
            collectionName: 'users',
            baseUrl: 'https://ryankotzen.com',
        };
        const inputValidator = createInputValidator();
        const outputValidator = createOutputValidator();
        const metadata = generateEntityMetadata(inputMetadata, inputValidator, outputValidator);
        expect(metadata).to.be.ok;
    });
});
