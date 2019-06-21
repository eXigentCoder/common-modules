'use strict';

const ObjectId = require(`mongodb`).ObjectId;
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
        describe(`Delete By Id`, () => {
            it(`Should throw an error if the entity to delete doesn't exist`, async () => {
                const { deleteById } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(deleteById(new ObjectId().toString(), createContext())).to.be.rejected;
            });
            it(`Should allow you to delete an existing entity - no stringId or tenant`, async () => {
                const { deleteById, create, getById } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                await deleteById(created._id, createContext());
                await expect(getById(created._id, createContext())).to.be.rejected;
            });
            it(`Should allow you to delete an existing entity - stringId no tenant`, async () => {
                const { deleteById, create, getById } = await getPopulatedCrud(stringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                await deleteById(created._id, createContext());
                await expect(getById(created._id, createContext())).to.be.rejected;
            });
            it(`Should allow you to delete an existing entity - stringId and tenant`, async () => {
                const { deleteById, create, getById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                await deleteById(created._id, context);
                await expect(getById(created._id, createContext())).to.be.rejected;
            });

            it(`Should not allow you to delete an existing entity by id from another tenant`, async () => {
                const { create, deleteById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                await expect(deleteById(created._id, createContext())).to.be.rejected;
            });

            it(`Should not delete if the tenant id in the execution context was falsy`, async () => {
                const { create, deleteById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                context.identity.tenant.id = ``;
                await expect(deleteById(created._id, context)).to.be.rejected;
            });
        });
    });
});
