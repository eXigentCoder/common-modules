'use strict';

const { addMongoId } = require(`.`);
const { createInputValidator } = require(`../validation/ajv`);
const ObjectId = require(`mongodb`).ObjectID;
describe(`Validation - MongoDB`, () => {
    describe(`mongoId keyword`, () => {
        it(`Should convert mongodb ids to the correct type`, () => {
            const simpleSchema = {
                name: `simple`,
                additionalProperties: false,
                properties: {
                    _id: { type: `string`, format: `mongoId`, mongoId: true },
                },
            };
            const validate = createInputValidator(addMongoId).compile(simpleSchema);
            const obj = {
                _id: new ObjectId().toString(),
            };
            expect(validate(obj)).to.be.ok;
            expect(typeof obj._id.toString()).to.equal(`string`);
            expect(ObjectId.isValid(obj._id)).to.be.ok;
        });

        it(`Should not convert mongodb ids if set to false`, () => {
            const simpleSchema = {
                name: `simple`,
                additionalProperties: false,
                properties: {
                    _id: { type: `string`, format: `mongoId`, mongoId: false },
                },
            };
            const validate = createInputValidator(addMongoId).compile(simpleSchema);
            const obj = {
                _id: new ObjectId().toString(),
            };
            expect(validate(obj)).to.be.ok;
            expect(typeof obj._id.toString()).to.equal(`string`);
            expect(ObjectId.isValid(obj._id)).to.be.ok;
        });
    });
});
