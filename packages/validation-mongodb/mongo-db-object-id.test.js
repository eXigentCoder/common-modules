'use strict';

const { mongoDbObjectId } = require(`./json-schema`);
const { createInputValidator } = require(`../validation/ajv`);
const addMongoDbObjectId = require(`./add-mongo-db-object-id`);
const mongodb = require(`mongodb`);
const schemaId = __filename;

describe(`Validation - MongoDB`, () => {
    describe(`mongoDbObjectId`, function() {
        const schema = {
            type: `object`,
            properties: { id: mongoDbObjectId() },
        };
        const validator = createInputValidator(addMongoDbObjectId);
        validator.addSchema(schema, schemaId);

        it(`should validate against at least 100 mongodb ObjectId strings`, function() {
            for (let i = 0; i < 100; i++) {
                const id = new mongodb.ObjectID();
                expect(validator.validate(schemaId, { id: id.toString() })).to.be.ok;
            }
        });

        it(`should validate against at least 100 mongodb ObjectId objects`, function() {
            for (let i = 0; i < 100; i++) {
                validator.ensureValid(schemaId, { id: new mongodb.ObjectID() });
            }
        });
        it(`should not validate against a non ObjectId object`, function() {
            for (let i = 0; i < 100; i++) {
                const valid = validator.validate(schemaId, { id: {} });
                expect(valid).to.not.be.ok;
            }
        });
    });
});
