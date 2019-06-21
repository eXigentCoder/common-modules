'use strict';

const {
    getPopulatedCrud,
    createContext,
    noStringIdNoTenant,
    stringIdNoTenant,
    stringIdTenant,
    validEntity,
} = require(`./test-utilities`);

describe(`MongoDB`, () => {
    describe(`CRUD`, () => {
        describe(`Get By Id`, () => {
            it(`Should allow you to get an existing entity by id - no stringId or tenant`, async () => {
                const { create, getById } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const retrieved = await getById(created._id, createContext());
                expect(created).to.eql(retrieved);
            });
            it(`Should allow you to get an existing entity by id - stringId no tenant`, async () => {
                const { create, getById } = await getPopulatedCrud(stringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const retrieved = await getById(created._id, createContext());
                expect(created).to.eql(retrieved);
            });
            it(`Should allow you to get an existing entity by id - stringId and tenant`, async () => {
                const { create, getById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                const retrieved = await getById(created._id, context);
                expect(created).to.eql(retrieved);
            });
            it(`Should not allow you to get an existing entity by id from another tenant`, async () => {
                const { create, getById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                await expect(getById(created._id, createContext())).to.be.rejected;
            });
        });
    });
});
