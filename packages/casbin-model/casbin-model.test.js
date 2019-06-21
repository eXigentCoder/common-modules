'use strict';

const { createModel, defaultPolicy } = require(`.`);
const { newEnforcer } = require(`casbin`);
const MongooseAdapter = require(`@elastic.io/casbin-mongoose-adapter`);
const { buildMongoUrl, getDb } = require(`../mongodb`);
const { dropExistingData } = require(`../mongodb-populate-from-disk`);
const urlConfig = {
    server: `localhost`,
    dbName: `test-casbin-model`,
};
const crypto = require(`crypto`);

describe(`Casbin Model`, () => {
    const allow = `allow`;
    const deny = `deny`;
    let db, model, adapter, connectionString;
    before(async () => {
        db = await getDb(urlConfig);
        model = createModel();
        connectionString = buildMongoUrl(urlConfig);
    });
    beforeEach(async () => {
        await dropExistingData(db, false);

        adapter = await MongooseAdapter.newAdapter(connectionString, {
            dbName: urlConfig.dbName,
            useNewUrlParser: true,
        });
    });
    it(`Should allow you to specify that a specific user can perform an action on a resource`, async () => {
        const userId = randomString();
        const resource = randomString();
        const action = randomString();
        const enforcer = await newEnforcer(model, adapter);
        await enforcer.addPolicy(userId, resource, action, allow);
        const allowed = await enforcer.enforce(userId, resource, action);
        expect(allowed).to.equal(true);
    });

    it(`Should not allow a non authorized user access`, async () => {
        const userId = randomString();
        const resource = randomString();
        const action = randomString();
        const enforcer = await newEnforcer(model, adapter);
        await enforcer.addPolicy(`not` + userId, resource, action, allow);
        const allowed = await enforcer.enforce(userId, resource, action);
        expect(allowed).to.equal(false);
    });

    it(`Should allow a user in a group to perform an action on a resource`, async () => {
        const userId = randomString();
        const resource = randomString();
        const action = randomString();
        const group = randomString();
        const enforcer = await newEnforcer(model, adapter);
        await enforcer.addPolicy(group, resource, action, allow);
        await enforcer.addGroupingPolicy(userId, group);
        const allowed = await enforcer.enforce(userId, resource, action);
        expect(allowed).to.equal(true);
    });

    it(`Should not allow a user in a group to perform an action on a resource if they are explicitly denied`, async () => {
        const userId = randomString();
        const resource = randomString();
        const action = randomString();
        const group = randomString();
        const enforcer = await newEnforcer(model, adapter);
        await enforcer.addPolicy(group, resource, action, allow);
        await enforcer.addPolicy(userId, resource, action, deny);
        await enforcer.addGroupingPolicy(userId, group);
        const allowed = await enforcer.enforce(userId, resource, action);
        expect(allowed).to.equal(false);
    });

    it(`Should allow a user who is in the super admin group`, async () => {
        const userId = randomString();
        const resource = randomString();
        const action = randomString();
        const superUserGroup = randomString();
        const enforcer = await newEnforcer(model, adapter);
        const policy = defaultPolicy(superUserGroup);
        await enforcer.addPolicy(...policy);
        await enforcer.addGroupingPolicy(userId, superUserGroup);
        const allowed = await enforcer.enforce(userId, resource, action);
        expect(allowed).to.equal(true);
    });

    afterEach(async () => {
        if (adapter) {
            await adapter.close();
        }
    });
});

function randomString() {
    return crypto.randomBytes(20).toString(`hex`);
}
