'use strict';

const { ValidationError, TenantError, NotAuthorizedError } = require(`../common-errors`);
const { buildMongoUrl } = require(`.`);
const { newEnforcer } = require(`casbin`);
const MongooseAdapter = require(`@elastic.io/casbin-mongoose-adapter`);

const {
    getPopulatedCrud,
    createContext,
    noStringIdNoTenant,
    stringIdNoTenant,
    stringIdTenant,
    validEntity,
    urlConfig,
    getRbacModel,
} = require(`./mongodb-crud.utilities.test`);

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
            it(`Should use the enforcer for authorization if one is provided`, async function() {
                this.timeout(5000);
                const connectionString = buildMongoUrl(urlConfig);
                const role = `user-admin`;
                const userId = `alice`;
                const adapter = await MongooseAdapter.newAdapter(connectionString, {
                    dbName: urlConfig.dbName,
                    useNewUrlParser: true,
                });
                const enforcer = await newEnforcer(getRbacModel(), adapter);
                await enforcer.addPolicy(userId, `users`, `create`);
                await enforcer.addPolicy(role, `users`, `create`);
                await enforcer.addGroupingPolicy(userId, role);

                const { create } = await getPopulatedCrud(stringIdNoTenant, enforcer);
                const entity = validEntity();
                const context = createContext(userId);
                const result = await create(entity, context);
                await expect(result).to.be.ok;
                const anAuthorizedContext = createContext();
                await expect(create(entity, anAuthorizedContext)).to.be.rejectedWith(
                    NotAuthorizedError
                );
                //add in when PR accepted
                //adapter.close();
            });
        });
    });
});
