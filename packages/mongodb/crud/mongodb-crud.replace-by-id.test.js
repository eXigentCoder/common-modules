'use strict';

const {
    getPopulatedCrud,
    createContext,
    noStringIdNoTenant,
    stringIdNoTenant,
    stringIdTenant,
    validEntity,
    withStatuses,
} = require(`../test-utilities`);

describe(`MongoDB`, () => {
    describe(`CRUD`, () => {
        describe(`Replace By Id`, () => {
            it(`Should allow you to replace an existing entity with a valid entity when using the main identifier - no stringId or tenant`, async () => {
                const { replaceById, create } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += `-updated`;
                const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                expect(replaced.username).to.eql(toUpdate.username);
                expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
            });
            it(`Should allow you to replace an existing entity with a valid entity when using the main identifier - stringId no tenant`, async () => {
                const { replaceById, create } = await getPopulatedCrud(stringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += `-updated`;
                const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                expect(replaced.username).to.eql(toUpdate.username);
                expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
            });
            it(`Should allow you to replace an existing entity with a valid entity when using the main identifier - stringId and tenant`, async () => {
                const { replaceById, create } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                expect(created.tenantId).to.be.ok;
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += `-updated`;
                const replaced = await replaceById(toUpdate._id, toUpdate, context);
                expect(replaced.username).to.eql(toUpdate.username);
                expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                expect(replaced.tenantId).to.eql(created.tenantId);
                expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
            });
            it(`Should not allow you to replace an existing entity if from a different tenant`, async () => {
                const { replaceById, create } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += `-updated`;
                await expect(replaceById(toUpdate._id, toUpdate, createContext())).to.be.rejected;
            });

            it(`Should not allow you to change the tenantId`, async () => {
                const { replaceById, create } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                expect(created.tenantId).to.be.ok;
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += `-updated`;
                toUpdate.tenantId += `-updated`;
                const replaced = await replaceById(toUpdate._id, toUpdate, context);
                expect(replaced.username).to.eql(toUpdate.username);
                expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                expect(replaced.tenantId).to.eql(created.tenantId);
                expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
            });
            it(`Should not allow you to remove the string identifier`, async () => {
                const { replaceById, create } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                expect(created.name).to.be.ok;
                const toUpdate = JSON.parse(JSON.stringify(created));
                delete toUpdate.name;
                const replaced = await replaceById(toUpdate._id.toString(), toUpdate, context);
                expect(replaced.name).to.eql(created.name);
            });
            describe(`Status Logic`, () => {
                it(`should allow you to update the entity without changing the status`, async () => {
                    const md = withStatuses(noStringIdNoTenant());
                    const { replaceById, create } = await getPopulatedCrud(md);
                    const entity = validEntity();
                    const statusData = { someReason: 42, saveMe: true };
                    entity.statusData = statusData;
                    const created = await create(entity, createContext());
                    expect(created.status).to.be.ok;
                    expect(created.statusDate).to.be.ok;
                    expect(created.statusLog).to.be.ok;
                    expect(created.statusData).to.not.be.ok;
                    const toUpdate = JSON.parse(JSON.stringify(created));
                    toUpdate.username += `-updated`;
                    try {
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());

                        expect(replaced.username).to.eql(toUpdate.username);
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                    } catch (err) {
                        console.error(err);
                    }
                });
            });
        });
    });
});
