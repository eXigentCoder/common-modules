'use strict';

const { NotAuthorizedError } = require(`../common-errors`);
const { buildMongoUrl } = require(`.`);
const { newEnforcer } = require(`casbin`);
const MongooseAdapter = require(`@elastic.io/casbin-mongoose-adapter`);

const {
    getPopulatedCrud,
    createContext,
    stringIdNoTenant,
    validEntity,
    urlConfig,
    getRbacModel,
    stringIdNoTenantOwnership,
} = require(`./mongodb-crud.utilities.test`);

describe(`MongoDB`, () => {
    describe(`CRUD`, () => {
        describe(`Auhtorization`, () => {
            describe(`enforcer`, () => {
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
                    //TODO test these added via the metadata
                    await enforcer.addPolicy(userId, `users`, `create`);
                    await enforcer.addPolicy(role, `users`, `create`);
                    await enforcer.addGroupingPolicy(userId, role);

                    const { create } = await getPopulatedCrud(stringIdNoTenant, enforcer);
                    const entity = validEntity();
                    const context = createContext(userId);
                    const result = await create(entity, context);
                    await expect(result).to.be.ok;
                    const unauthorizedContext = createContext();
                    await expect(create(entity, unauthorizedContext)).to.be.rejectedWith(
                        NotAuthorizedError
                    );
                    //add in when PR accepted
                    //adapter.close();
                });
            });
        });
        describe(`ownership`, () => {
            it(`Should not allow someone who isn't the owner to perform the action`, async function() {
                this.timeout(5000);
                const userId = `alice`;
                const inputMetadata = stringIdNoTenantOwnership({ idSchema: { type: `string` } });
                const { create, deleteById } = await getPopulatedCrud(inputMetadata);
                const entity = validEntity();
                const context = createContext(userId);
                const result = await create(entity, context);
                await expect(result).to.be.ok;
                const unauthorizedContext = createContext();
                await expect(deleteById(result._id, unauthorizedContext)).to.be.rejectedWith(
                    NotAuthorizedError
                );
                await deleteById(result._id, context);
            });
            it(`Should allow you to specify a * for actions`, async function() {
                this.timeout(5000);
                const userId = `alice`;
                const inputMetadata = stringIdNoTenantOwnership({
                    idSchema: { type: `string` },
                    allowedActions: [`*`],
                });
                const { create, getById, search, replaceById, deleteById } = await getPopulatedCrud(
                    inputMetadata
                );
                const entity = validEntity();
                const context = createContext(userId);
                const created = await create(entity, context);
                await expect(created).to.be.ok;
                const item = await getById(created._id, context);
                await expect(item).to.be.ok;
                const searchResults = await search({ filter: { _id: created._id } }, context);
                await expect(searchResults).to.be.ok;
                await expect(searchResults[0]).to.eql(created);
                const toUpdate = JSON.parse(JSON.stringify(create));
                toUpdate.username += `updated`;
                const replaced = await replaceById(created._id, toUpdate, context);
                expect(replaced).to.be.ok;
                await deleteById(created._id, context);
            });
        });
    });
});
