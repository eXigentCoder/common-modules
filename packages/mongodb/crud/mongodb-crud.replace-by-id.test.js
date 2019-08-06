'use strict';

const { ValidationError } = require(`../../common-errors`);
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
                const statusData = { someReason: 42, saveMe: true };

                describe(`Status required, data required`, () => {
                    let created, replaceById;
                    beforeEach(async () => {
                        const md = withStatuses(noStringIdNoTenant());
                        const crud = await getPopulatedCrud(md);
                        replaceById = crud.replaceById;
                        const entity = validEntity();
                        entity.status = `todo`;
                        entity.statusData = statusData;
                        created = await crud.create(entity, createContext());
                        expect(created.status).to.be.ok;
                        expect(created.statusDate).to.be.ok;
                        expect(created.statusLog).to.be.ok;
                        expect(created.statusData).to.not.be.ok;
                    });

                    it(`should allow you to update the entitys required status without changing the rest of the entity`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(created));
                        const newStatus = `done`;
                        toUpdate.status = newStatus;
                        toUpdate.statusData = statusData;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.eql(newStatus);
                        expect(replaced.statusDate).to.not.eql(created.statusDate);
                        expect(replaced.statusLog).to.not.eql(created.statusLog);
                        expect(replaced.statusLog).to.have.length(2);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                    it(`should not allow you to update the entitys required status without providing status data`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(created));
                        const newStatus = `done`;
                        toUpdate.status = newStatus;
                        await expect(replaceById(toUpdate._id, toUpdate, createContext())).to.be
                            .rejected;
                    });
                    it(`should not alter the object's required status properties if updating the entity only`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(created));
                        toUpdate.username += `-updated`;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.eql(created.status);
                        expect(replaced.statusDate).to.eql(created.statusDate);
                        expect(replaced.statusLog).to.eql(created.statusLog);
                        expect(replaced.statusLog).to.length(1);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                    it(`should not alow you to clear the status`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(created));
                        delete toUpdate.status;
                        delete toUpdate.statusDate;
                        delete toUpdate.statusLog;
                        await expect(
                            replaceById(toUpdate._id, toUpdate, createContext())
                        ).to.be.rejectedWith(ValidationError);
                    });
                });
                describe(`Status not required, data required`, () => {
                    let hasStatus, noStatus, replaceById;
                    beforeEach(async () => {
                        const md = withStatuses(noStringIdNoTenant(), { isRequired: false });
                        const crud = await getPopulatedCrud(md);
                        replaceById = crud.replaceById;
                        let entity = validEntity();
                        entity.status = `todo`;
                        entity.statusData = statusData;
                        hasStatus = await crud.create(entity, createContext());
                        expect(hasStatus.status).to.be.ok;
                        expect(hasStatus.statusDate).to.be.ok;
                        expect(hasStatus.statusLog).to.be.ok;
                        expect(hasStatus.statusData).to.not.be.ok;
                        entity = validEntity();
                        noStatus = await crud.create(entity, createContext());
                        expect(noStatus.status).to.be.not.ok;
                        expect(noStatus.statusDate).to.not.be.ok;
                        expect(noStatus.statusLog).to.not.be.ok;
                        expect(noStatus.statusData).to.not.be.ok;
                    });
                    it(`should allow you to update the entitys existing status without changing the rest of the entity`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(hasStatus));
                        const newStatus = `done`;
                        toUpdate.status = newStatus;
                        toUpdate.statusData = statusData;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.eql(newStatus);
                        expect(replaced.statusDate).to.not.eql(hasStatus.statusDate);
                        expect(replaced.statusLog).to.not.eql(hasStatus.statusLog);
                        expect(replaced.statusLog).to.have.length(2);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                    it(`should not allow you to update the entitys existing status without providing status data`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(hasStatus));
                        const newStatus = `done`;
                        toUpdate.status = newStatus;
                        await expect(replaceById(toUpdate._id, toUpdate, createContext())).to.be
                            .rejected;
                    });
                    it(`should allow you to update an entity to have a status`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(noStatus));
                        const newStatus = `todo`;
                        toUpdate.status = newStatus;
                        toUpdate.statusData = statusData;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.eql(newStatus);
                        expect(replaced.statusDate).to.not.eql(noStatus.statusDate);
                        expect(replaced.statusLog).to.not.eql(noStatus.statusLog);
                        expect(replaced.statusLog).to.have.length(1);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                    it(`should not allow you to set a status without providing status data`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(noStatus));
                        const newStatus = `todo`;
                        toUpdate.status = newStatus;
                        await expect(replaceById(toUpdate._id, toUpdate, createContext())).to.be
                            .rejected;
                    });
                    it(`should allow you to clear a status on an entity but not the log`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(hasStatus));
                        delete toUpdate.status;
                        toUpdate.statusData = statusData;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.not.be.ok;
                        expect(replaced.statusDate).to.be.ok;
                        expect(replaced.statusDate).to.not.eql(hasStatus.statusDate);
                        expect(replaced.statusLog).to.be.ok;
                        expect(replaced.statusLog).to.not.eql(hasStatus.statusLog);
                        expect(replaced.statusLog).to.have.length(2);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                });
                describe(`Status not required, data not required`, () => {
                    let hasStatus, noStatus, replaceById;
                    beforeEach(async () => {
                        const md = withStatuses(noStringIdNoTenant(), {
                            isRequired: false,
                            dataRequired: false,
                        });
                        const crud = await getPopulatedCrud(md);
                        replaceById = crud.replaceById;
                        let entity = validEntity();
                        entity.status = `todo`;
                        entity.statusData = statusData;
                        hasStatus = await crud.create(entity, createContext());
                        expect(hasStatus.status).to.be.ok;
                        expect(hasStatus.statusDate).to.be.ok;
                        expect(hasStatus.statusLog).to.be.ok;
                        expect(hasStatus.statusData).to.not.be.ok;
                        entity = validEntity();
                        noStatus = await crud.create(entity, createContext());
                        expect(noStatus.status).to.be.not.ok;
                        expect(noStatus.statusDate).to.not.be.ok;
                        expect(noStatus.statusLog).to.not.be.ok;
                        expect(noStatus.statusData).to.not.be.ok;
                    });
                    it(`should allow you to update the entitys existing status without changing the rest of the entity if provided status data`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(hasStatus));
                        const newStatus = `done`;
                        toUpdate.status = newStatus;
                        toUpdate.statusData = statusData;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.eql(newStatus);
                        expect(replaced.statusDate).to.not.eql(hasStatus.statusDate);
                        expect(replaced.statusLog).to.not.eql(hasStatus.statusLog);
                        expect(replaced.statusLog).to.have.length(2);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                    it(`should allow you to update the entitys existing status without changing the rest of the entity if not provided status data`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(hasStatus));
                        const newStatus = `done`;
                        toUpdate.status = newStatus;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.eql(newStatus);
                        expect(replaced.statusDate).to.not.eql(hasStatus.statusDate);
                        expect(replaced.statusLog).to.not.eql(hasStatus.statusLog);
                        expect(replaced.statusLog).to.have.length(2);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                    it(`should allow you to update an entity to have a status if provided status data`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(noStatus));
                        const newStatus = `todo`;
                        toUpdate.status = newStatus;
                        toUpdate.statusData = statusData;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.eql(newStatus);
                        expect(replaced.statusDate).to.not.eql(noStatus.statusDate);
                        expect(replaced.statusLog).to.not.eql(noStatus.statusLog);
                        expect(replaced.statusLog).to.have.length(1);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                    it(`should allow you to update an entity to have a status if not provided status data`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(noStatus));
                        const newStatus = `todo`;
                        toUpdate.status = newStatus;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.eql(newStatus);
                        expect(replaced.statusDate).to.not.eql(noStatus.statusDate);
                        expect(replaced.statusLog).to.not.eql(noStatus.statusLog);
                        expect(replaced.statusLog).to.have.length(1);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                    it(`should allow you to clear the status on an existing entity but not the log with status data`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(hasStatus));
                        delete toUpdate.status;
                        toUpdate.statusData = statusData;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.not.be.ok;
                        expect(replaced.statusDate).to.be.ok;
                        expect(replaced.statusDate).to.not.eql(hasStatus.statusDate);
                        expect(replaced.statusLog).to.be.ok;
                        expect(replaced.statusLog).to.not.eql(hasStatus.statusLog);
                        expect(replaced.statusLog).to.have.length(2);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                    it(`should allow you to clear the status on an existing entity but not the log without status data`, async () => {
                        const toUpdate = JSON.parse(JSON.stringify(hasStatus));
                        delete toUpdate.status;
                        const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                        expect(replaced._id.toString()).to.eql(toUpdate._id.toString());
                        expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
                        expect(replaced.status).to.not.be.ok;
                        expect(replaced.statusDate).to.be.ok;
                        expect(replaced.statusDate).to.not.eql(hasStatus.statusDate);
                        expect(replaced.statusLog).to.be.ok;
                        expect(replaced.statusLog).to.not.eql(hasStatus.statusLog);
                        expect(replaced.statusLog).to.have.length(2);
                        expect(replaced.statusData).to.not.be.ok;
                    });
                });
            });
        });
    });
});
