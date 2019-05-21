'use strict';
const { createInputValidator, createOutputValidator } = require('../validation/ajv');
const ensureSchemaSet = require('./ensure-schema-set');

describe('Entity Metadata', () => {
    describe('ensureSchemaSet', () => {
        const inputValidator = createInputValidator();
        const outputValidator = createOutputValidator();
        it('should not throw an error when adding the same schema twice', () => {
            const metadata = {
                collectionName: 'bobs',
                schemas: {
                    core: {
                        $id: 'someAwesomeSchema',
                        name: 'bob',
                    },
                },
            };
            //@ts-ignore
            ensureSchemaSet(metadata, 'output', 'Output', outputValidator, inputValidator);
            //@ts-ignore
            ensureSchemaSet(metadata, 'output', 'Output', outputValidator, inputValidator);
        });
    });
});
