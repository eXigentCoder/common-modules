'use strict';
const { createInputValidator, createOutputValidator } = require(`../validation/ajv`);
const ensureSchemaSet = require(`./ensure-schema-set`);

describe(`Entity Metadata`, () => {
    describe(`ensureSchemaSet`, () => {
        const inputValidator = createInputValidator();
        const outputValidator = createOutputValidator();
        it(`should not throw an error when adding the same schema twice`, () => {
            /**@type {import('./types').EntityMetadata} */
            const metadata = {
                collectionName: `bobs`,
                schemas: {
                    core: {
                        $id: `someAwesomeSchema`,
                        title: `bob`,
                    },
                },
                name: `bob`,
                identifier: {
                    pathToId: `_id`,
                    schema: {},
                },
                baseUrl: `https://ryankotzen.com`,
            };
            //@ts-ignore
            ensureSchemaSet(metadata, `output`, `Output`, outputValidator, inputValidator);
            //@ts-ignore
            ensureSchemaSet(metadata, `output`, `Output`, outputValidator, inputValidator);
        });
    });
});
