'use strict';

const { addMongoDbObjectId } = require(`.`);
const { createInputValidator } = require(`../validation/ajv`);
const ObjectId = require(`mongodb`).ObjectID;
describe(`Validation - MongoDB`, () => {
    describe(`mongoDbObjectIdCoercion keyword`, () => {
        it(`Should be able to coerce mongodb ids to strings`, () => {
            const simpleSchema = {
                name: `simple`,
                additionalProperties: false,
                properties: {
                    _id: {
                        type: [`string`, `object`],
                        format: `mongoDbObjectId`,
                        mongoDbObjectIdCoercion: `string`,
                    },
                },
            };
            const validate = createInputValidator(addMongoDbObjectId).compile(simpleSchema);
            const obj = {
                _id: new ObjectId().toString(),
            };
            expect(validate(obj)).to.be.ok;
            expect(typeof obj._id).to.equal(`string`);
            expect(ObjectId.isValid(obj._id)).to.be.ok;
        });

        it(`Should be able to coerce mongodb ids to objects`, () => {
            const simpleSchema = {
                name: `simple`,
                additionalProperties: false,
                properties: {
                    _id: {
                        type: [`string`, `object`],
                        format: `mongoDbObjectId`,
                        mongoDbObjectIdCoercion: `object`,
                    },
                },
            };
            const validate = createInputValidator(addMongoDbObjectId).compile(simpleSchema);
            const obj = {
                _id: new ObjectId().toString(),
            };
            expect(validate(obj)).to.be.ok;
            expect(typeof obj._id).to.equal(`object`);
            expect(ObjectId.isValid(obj._id)).to.be.ok;
        });

        it(`Should leave the value as is if no coercion specified`, () => {
            const simpleSchema = {
                name: `simple`,
                additionalProperties: false,
                properties: {
                    _id: {
                        type: `string`,
                        format: `mongoDbObjectId`,
                    },
                },
            };
            const validate = createInputValidator(addMongoDbObjectId).compile(simpleSchema);
            const obj = {
                _id: new ObjectId().toString(),
            };
            expect(validate(obj)).to.be.ok;
            expect(typeof obj._id).to.equal(`string`);
            expect(ObjectId.isValid(obj._id)).to.be.ok;
        });
    });
});
