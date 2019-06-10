'use strict';

const { createOutputValidator, createOutputMapper } = require(`./`);
describe(`Validation`, () => {
    describe(`Create Output Mapper`, () => {
        it(`should successfully run after creation`, () => {
            const validator = createOutputValidator();
            const simpleSchema = {
                $id: `https://ryankotzen.com/schemas/test`,
                name: `simple`,
                additionalProperties: false,
                properties: {
                    integerValue: {
                        type: `integer`,
                    },
                },
            };
            validator.addSchema(simpleSchema);
            const mapOutput = createOutputMapper(simpleSchema.$id, validator);
            const valueObject = {
                integerValue: `2`,
            };
            mapOutput(valueObject);
            expect(typeof valueObject.integerValue).to.equal(`number`);
        });
    });
});
