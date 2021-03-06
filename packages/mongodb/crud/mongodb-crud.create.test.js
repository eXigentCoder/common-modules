'use strict';

const { ValidationError, TenantError } = require(`../../common-errors`);

const {
    getPopulatedCrud,
    withStatuses,
    createContext,
    noStringIdNoTenant,
    stringIdNoTenant,
    stringIdTenant,
    validEntity,
} = require(`../test-utilities`);

describe(`MongoDB`, () => {
    describe(`CRUD`, () => {
        describe(`Create`, () => {
            it(`Should throw a validation error if the item is null`, async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(null, createContext())).to.be.rejectedWith(ValidationError);
            });
            it(`Should throw a validation error if the item is undefined`, async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(undefined, createContext())).to.be.rejectedWith(
                    ValidationError
                );
            });
            it(`Should throw a validation error if the item is a number`, async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(1, createContext())).to.be.rejectedWith(ValidationError);
            });
            it(`Should throw a validation error if the item is a string`, async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(`1`, createContext())).to.be.rejectedWith(ValidationError);
            });
            it(`Should throw a validation error if the item is a boolean`, async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(true, createContext())).to.be.rejectedWith(ValidationError);
            });
            it(`Should throw a validation error if the item is a symbol`, async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(Symbol(`wrong`), createContext())).to.be.rejectedWith(
                    ValidationError
                );
            });
            it(`Should allow you to create a valid entity - no stringId or tenant`, async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                expect(entity.username).to.equal(created.username);
                expect(entity._id).to.not.be.ok;
                expect(entity.versionInfo).to.not.be.ok;
                expect(created).to.be.ok;
                expect(created._id).to.be.ok;
                expect(created.versionInfo).to.be.ok;
            });
            it(`Should allow you to create a valid entity - stringId no tenant`, async () => {
                const { create } = await getPopulatedCrud(stringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                expect(entity.username).to.equal(created.username);
                expect(entity._id).to.not.be.ok;
                expect(entity.versionInfo).to.not.be.ok;
                expect(created).to.be.ok;
                expect(created._id).to.be.ok;
                expect(created.versionInfo).to.be.ok;
                expect(created.name).to.be.ok;
            });
            it(`Should allow you to create a valid entity - stringId and tenant`, async () => {
                const { create } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                expect(entity.username).to.equal(created.username);
                expect(entity._id).to.not.be.ok;
                expect(entity.versionInfo).to.not.be.ok;
                expect(created).to.be.ok;
                expect(created._id).to.be.ok;
                expect(created.versionInfo).to.be.ok;
                expect(created.name).to.be.ok;
                expect(created.tenantId).to.be.ok;
            });
            it(`Should throw an error if the tenant id in the execution context was falsy`, async () => {
                const { create } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                context.identity.tenant.id = ``;
                await expect(create(entity, context)).to.be.rejectedWith(TenantError);
            });
            describe(`Status Logic`, () => {
                const statusData = { someReason: 42, saveMe: true };
                it(`Should have the first status if the metadata has it specified as required`, async () => {
                    const md = withStatuses(stringIdTenant(), { dataRequired: false });
                    const { create } = await getPopulatedCrud(md);
                    const entity = validEntity();
                    const context = createContext();
                    const created = await create(entity, context);
                    expect(created.status).to.be.ok;
                    expect(created.statusDate).to.be.ok;
                    expect(created.statusLog).to.be.ok;
                    expect(created.statusData).to.not.be.ok;
                });
                it(`Should throw an error if statusData provided but no status`, async () => {
                    const md = withStatuses(stringIdTenant(), {
                        dataRequired: false,
                        isRequired: false,
                    });
                    const { create } = await getPopulatedCrud(md);
                    const entity = validEntity();
                    entity.statusData = statusData;
                    const context = createContext();
                    await expect(create(entity, context)).to.be.rejected;
                });
                it(`Should not have a status if one was not provided and the definition had one allowed but not required`, async () => {
                    const md = withStatuses(stringIdTenant(), {
                        isRequired: false,
                        dataRequired: false,
                    });
                    const { create } = await getPopulatedCrud(md);
                    const entity = validEntity();
                    const context = createContext();
                    const created = await create(entity, context);
                    expect(created.status).to.not.be.ok;
                    expect(created.statusDate).to.not.be.ok;
                    expect(created.statusLog).to.not.be.ok;
                    expect(created.statusData).to.not.be.ok;
                });
                it(`Should allow you to set a valid status if one is required`, async () => {
                    const md = withStatuses(stringIdTenant(), { dataRequired: false });
                    const { create } = await getPopulatedCrud(md);
                    const entity = validEntity();
                    entity.status = `todo`;
                    const context = createContext();
                    const created = await create(entity, context);
                    expect(created.status).to.be.ok;
                    expect(created.statusDate).to.be.ok;
                    expect(created.statusLog).to.be.ok;
                    expect(created.statusData).to.not.be.ok;
                });
                it(`Should allow you to pass through status data`, async () => {
                    const md = withStatuses(stringIdTenant());
                    const { create } = await getPopulatedCrud(md);
                    const entity = validEntity();
                    entity.status = `todo`;

                    entity.statusData = statusData;
                    const context = createContext();
                    const created = await create(entity, context);
                    expect(created.status).to.be.ok;
                    expect(created.statusDate).to.be.ok;
                    expect(created.statusLog).to.be.ok;
                    expect(created.statusData).to.not.be.ok;
                    expect(created.statusLog[0].data).to.eql(statusData);
                });
            });
        });
    });
});
