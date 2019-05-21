'use strict';

const { getDb, getCrud, createQueryStringMapper } = require('.');
const generateEntityMetadata = require('../entity-metadata');
const { createInputValidator, createOutputValidator } = require('../validation');
const { jsonSchemas, addMongoId } = require('../validation-mongodb');
const crypto = require('crypto');

describe('MongoDB', () => {
    describe('CRUD', () => {
        describe('Create', () => {
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
            it('Should allow you to create a valid entity', async () => {
                const { deleteById, create, getById } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                await deleteById(created._id, createContext());
                await expect(getById(created._id)).to.be.rejected;
            });
        });
        describe('Get By Id', () => {
            it('Should allow you to create a valid entity', async () => {
                const { create, getById } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                const retrieved = await getById(created._id);
                expect(created).to.eql(retrieved);
            });
        });
        describe('Replace By Id', () => {
            it('Should allow you to create a valid entity', async () => {
                const { replaceById, create } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += '-updated';
                const replaced = await replaceById(toUpdate, createContext());
                expect(replaced.username).to.eql(toUpdate.username);
                expect(replaced._id).to.eql(toUpdate._id);
                expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
            });
        });
        describe('Search', () => {
            it('Should allow you to create a valid entity', async () => {
                const { search, create, queryMapper } = await getPopulatedCrud();
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query);
                expect(results).to.be.an('array');
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
        });
    });
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
    return {
        ...crud,
        queryMapper,
    };
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
    };
}
function randomString() {
    return crypto.randomBytes(20).toString('hex');
}
