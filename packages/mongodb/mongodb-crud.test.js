'use strict';

const { ValidationError } = require('../common-errors');
const { getClient, getDb, getCrud, createQueryStringMapper } = require('.');
const generateEntityMetadata = require('../entity-metadata');
const { createInputValidator, createOutputValidator } = require('../validation');
const { jsonSchemas, addMongoId } = require('../validation-mongodb');
const schemas = require('../json-schema');
const crypto = require('crypto');
const ObjectId = require('mongodb').ObjectId;

//todo rk needs to be more extensive. string identifier and normal identifier.

describe('MongoDB', () => {
    describe('CRUD', () => {
        describe('Create', () => {
            it('Should throw a validation error if the item is null', async () => {
                const { create } = await getPopulatedCrud();
                await expect(create(null, createContext())).to.be.rejectedWith(ValidationError);
            });
            it('Should throw a validation error if the item is undefined', async () => {
                const { create } = await getPopulatedCrud();
                await expect(create(undefined, createContext())).to.be.rejectedWith(
                    ValidationError
                );
            });
            it('Should throw a validation error if the item is a number', async () => {
                const { create } = await getPopulatedCrud();
                await expect(create(1, createContext())).to.be.rejectedWith(ValidationError);
            });
            it('Should throw a validation error if the item is a string', async () => {
                const { create } = await getPopulatedCrud();
                await expect(create('1', createContext())).to.be.rejectedWith(ValidationError);
            });
            it('Should throw a validation error if the item is a boolean', async () => {
                const { create } = await getPopulatedCrud();
                await expect(create(true, createContext())).to.be.rejectedWith(ValidationError);
            });
            it('Should throw a validation error if the item is a symbol', async () => {
                const { create } = await getPopulatedCrud();
                await expect(create(Symbol('wrong'), createContext())).to.be.rejectedWith(
                    ValidationError
                );
            });
            it('Should allow you to create a valid entity', async () => {
                const { create } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                expect(entity.username).to.equal(created.username);
                expect(entity._id).to.not.be.ok;
                expect(entity.versionInfo).to.not.be.ok;
                expect(created).to.be.ok;
                expect(created._id).to.be.ok;
                expect(created.versionInfo).to.be.ok;
            });
        });
        describe('Delete By Id', () => {
            it('Should allow you to delete an existing entity', async () => {
                const { deleteById, create, getById } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                await deleteById(created._id, createContext());
                await expect(getById(created._id, createContext())).to.be.rejected;
            });
            it("Should throw an error if the entity to delete doesn't exist", async () => {
                const { deleteById } = await getPopulatedCrud();
                await expect(deleteById(new ObjectId().toString(), createContext())).to.be.rejected;
            });
        });
        describe('Get By Id', () => {
            it('Should allow you to get an existing entity by id', async () => {
                const { create, getById } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                const retrieved = await getById(created._id, createContext());
                expect(created).to.eql(retrieved);
            });
        });
        describe('Replace By Id', () => {
            it('Should allow you to replace an existing entity with a valid entity when using the main identifier', async () => {
                const { replaceById, create } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += '-updated';
                const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                expect(replaced.username).to.eql(toUpdate.username);
                expect(replaced._id).to.eql(toUpdate._id);
                expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
            });
        });
        describe('Search', () => {
            it('Should allow you to search', async () => {
                const { search, create, queryMapper } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query, createContext());
                expect(results).to.be.an('array');
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it('Should allow you to search with just a filter', async () => {
                const { search, create } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = { filter: { username: entity.username } };
                const results = await search(query, createContext());
                expect(results).to.be.an('array');
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it('Should allow you to search if filter is passed through without the filter keyword', async () => {
                const { search, create } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = { username: entity.username };
                const results = await search(query, createContext());
                expect(results).to.be.an('array');
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
        });

        describe('Utilities', () => {
            describe('setStringIdentifier', () => {
                it('Should set the identifier from the source', async () => {
                    const { utilities } = await getPopulatedCrud();
                    const { setStringIdentifier } = utilities;
                    const entity = validEntity();
                    expect(entity.name).to.not.be.ok;
                    setStringIdentifier(entity);
                    expect(entity.name).to.be.ok;
                });
                it('Should not replace one if it already exists', async () => {
                    const { utilities } = await getPopulatedCrud();
                    const { setStringIdentifier } = utilities;
                    const setName = 'bob';
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
after(async () => {
    const client = await getClient();
    if (client) {
        await client.close();
    }
});

async function getPopulatedCrud() {
    const urlConfig = {
        server: 'localhost',
        dbName: 'test-common',
    };
    const db = await getDb(urlConfig);
    const inputValidator = createInputValidator(addMongoId);
    const outputValidator = createOutputValidator(addMongoId);
    const inputMetadata = validMetaData();
    const metadata = generateEntityMetadata(inputMetadata, inputValidator, outputValidator);
    const queryMapper = createQueryStringMapper(metadata.schemas.core);
    const crud = await getCrud({
        db,
        inputValidator,
        metadata,
        outputValidator,
    });
    crud.queryMapper = queryMapper;
    return crud;
}

function validMetaData() {
    return {
        schemas: {
            core: {
                name: 'user',
                properties: {
                    username: {
                        type: 'string',
                    },
                },
            },
        },
        identifier: { name: '_id', schema: jsonSchemas.objectId },
        stringIdentifier: { name: 'name', schema: schemas.identifier, source: 'username' },
        collectionName: 'crud-users',
        baseUrl: 'https://ryankotzen.com',
    };
}

function validEntity() {
    return {
        username: `bob-${randomString()}`,
    };
}

function createContext() {
    return {
        requestId: randomString(),
        identity: {
            id: randomString(),
        },
        codeVersion: '0.0.1',
        sourceIp: '127.0.0.1',
        source: 'tests',
    };
}
function randomString() {
    return crypto.randomBytes(20).toString('hex');
}
