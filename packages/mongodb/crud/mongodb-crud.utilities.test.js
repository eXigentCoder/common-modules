'use strict';

const { getPopulatedCrud, validEntity, stringIdNoTenant } = require(`../test-utilities`);

describe(`MongoDB`, () => {
    describe(`CRUD`, () => {
        describe(`Utilities`, () => {
            describe(`setStringIdentifier`, () => {
                it(`Should set the identifier from the source`, async () => {
                    const { utilities } = await getPopulatedCrud(stringIdNoTenant);
                    const { setStringIdentifier } = utilities;
                    const entity = validEntity();
                    expect(entity.name).to.not.be.ok;
                    setStringIdentifier(entity);
                    expect(entity.name).to.be.ok;
                });
                it(`Should not replace one if it already exists`, async () => {
                    const { utilities } = await getPopulatedCrud(stringIdNoTenant);
                    const { setStringIdentifier } = utilities;
                    const setName = `bob`;
                    const entity = validEntity();
                    expect(entity.name).to.not.be.ok;
                    entity.name = setName;
                    setStringIdentifier(entity);
                    expect(entity.name).to.equal(setName);
                });
            });
        });
    });
});
