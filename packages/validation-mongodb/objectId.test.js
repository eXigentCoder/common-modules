'use strict';

const { objectId } = require('./json-schema');
const { createInputValidator } = require('../validation/ajv');
const addMongoId = require('./add-mongo-id');
const mongodb = require('mongodb');
const schemaId = __filename;

describe('JSON Schemas - ObjectId', function() {
    const schema = {
        type: 'object',
        properties: { id: objectId },
    };
    const validator = createInputValidator(addMongoId);
    validator.addSchema(schema, schemaId);

    it('should validate against at least 100 mongoId strings', function() {
        for (let i = 0; i < 100; i++) {
            const id = new mongodb.ObjectID();
            expect(validator.validate(schemaId, { id: id.toString() })).to.be.ok;
        }
    });

    it('should validate against at least 100 mongoId objects', function() {
        for (let i = 0; i < 100; i++) {
            validator.ensureValid(schemaId, { id: new mongodb.ObjectID() });
        }
    });
    it('should not validate against a non ObjectId object', function() {
        for (let i = 0; i < 100; i++) {
            const valid = validator.validate(schemaId, { id: {} });
            expect(valid).to.not.be.ok;
        }
    });
});
