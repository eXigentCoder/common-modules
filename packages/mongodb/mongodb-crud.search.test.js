'use strict';

const {
    getPopulatedCrud,
    createContext,
    noStringIdNoTenant,
    stringIdNoTenant,
    stringIdTenant,
    validEntity,
} = require(`./mongodb-crud.utilities.test`);

describe(`MongoDB`, () => {
    describe(`CRUD`, () => {
        describe(`Search`, () => {
            it(`Should allow you to search with just a filter`, async () => {
                const { search, create } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = { filter: { username: entity.username } };
                const results = await search(query, createContext());
                expect(results).to.be.an(`array`);
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it(`Should allow you to search if filter is passed through without the filter keyword`, async () => {
                const { search, create } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = { username: entity.username };
                const results = await search(query, createContext());
                expect(results).to.be.an(`array`);
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it(`Should allow you to search - no stringId or tenant`, async () => {
                const { search, create, queryMapper } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query, createContext());
                expect(results).to.be.an(`array`);
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it(`Should allow you to search - stringId no tenant`, async () => {
                const { search, create, queryMapper } = await getPopulatedCrud(stringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query, createContext());
                expect(results).to.be.an(`array`);
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it(`Should allow you to search - stringId and tenant`, async () => {
                const { search, create, queryMapper } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query, context);
                expect(results).to.be.an(`array`);
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it(`Should not return results from other tenants`, async () => {
                const { search, create, queryMapper } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                await create(entity, createContext());
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query, createContext());
                expect(results).to.be.an(`array`);
                expect(results).to.have.length(0);
            });
        });

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
