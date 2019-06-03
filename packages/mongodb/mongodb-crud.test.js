'use strict';

const { ValidationError, TenantError } = require('../common-errors');
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
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(null, createContext())).to.be.rejectedWith(ValidationError);
            });
            it('Should throw a validation error if the item is undefined', async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(undefined, createContext())).to.be.rejectedWith(
                    ValidationError
                );
            });
            it('Should throw a validation error if the item is a number', async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(1, createContext())).to.be.rejectedWith(ValidationError);
            });
            it('Should throw a validation error if the item is a string', async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create('1', createContext())).to.be.rejectedWith(ValidationError);
            });
            it('Should throw a validation error if the item is a boolean', async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(true, createContext())).to.be.rejectedWith(ValidationError);
            });
            it('Should throw a validation error if the item is a symbol', async () => {
                const { create } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(create(Symbol('wrong'), createContext())).to.be.rejectedWith(
                    ValidationError
                );
            });
            it('Should allow you to create a valid entity - no stringId or tenant', async () => {
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
            it('Should allow you to create a valid entity - stringId no tenant', async () => {
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
            it('Should allow you to create a valid entity - stringId and tenant', async () => {
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
            it('Should throw an error if the tenant id in the execution context was falsy', async () => {
                const { create } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                context.identity.tenant.id = '';
                await expect(create(entity, context)).to.be.rejectedWith(TenantError);
            });
        });
        describe('Delete By Id', () => {
            it("Should throw an error if the entity to delete doesn't exist", async () => {
                const { deleteById } = await getPopulatedCrud(noStringIdNoTenant);
                await expect(deleteById(new ObjectId().toString(), createContext())).to.be.rejected;
            });
            it('Should allow you to delete an existing entity - no stringId or tenant', async () => {
                const { deleteById, create, getById } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                await deleteById(created._id, createContext());
                await expect(getById(created._id, createContext())).to.be.rejected;
            });
            it('Should allow you to delete an existing entity - stringId no tenant', async () => {
                const { deleteById, create, getById } = await getPopulatedCrud(stringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                await deleteById(created._id, createContext());
                await expect(getById(created._id, createContext())).to.be.rejected;
            });
            it('Should allow you to delete an existing entity - stringId and tenant', async () => {
                const { deleteById, create, getById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                await deleteById(created._id, context);
                await expect(getById(created._id, createContext())).to.be.rejected;
            });

            it('Should not allow you to delete an existing entity by id from another tenant', async () => {
                const { create, deleteById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                await expect(deleteById(created._id, createContext())).to.be.rejected;
            });

            it('Should not delete if the tenant id in the execution context was falsy', async () => {
                const { create, deleteById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                context.identity.tenant.id = '';
                await expect(deleteById(created._id, context)).to.be.rejected;
            });
        });
        describe('Get By Id', () => {
            it('Should allow you to get an existing entity by id - no stringId or tenant', async () => {
                const { create, getById } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const retrieved = await getById(created._id, createContext());
                expect(created).to.eql(retrieved);
            });
            it('Should allow you to get an existing entity by id - stringId no tenant', async () => {
                const { create, getById } = await getPopulatedCrud(stringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const retrieved = await getById(created._id, createContext());
                expect(created).to.eql(retrieved);
            });
            it('Should allow you to get an existing entity by id - stringId and tenant', async () => {
                const { create, getById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                const retrieved = await getById(created._id, context);
                expect(created).to.eql(retrieved);
            });
            it('Should not allow you to get an existing entity by id from another tenant', async () => {
                const { create, getById } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                await expect(getById(created._id, createContext())).to.be.rejected;
            });
        });
        describe('Replace By Id', () => {
            it('Should allow you to replace an existing entity with a valid entity when using the main identifier - no stringId or tenant', async () => {
                const { replaceById, create } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += '-updated';
                const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                expect(replaced.username).to.eql(toUpdate.username);
                expect(replaced._id).to.eql(toUpdate._id);
                expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
            });
            it('Should allow you to replace an existing entity with a valid entity when using the main identifier - stringId no tenant', async () => {
                const { replaceById, create } = await getPopulatedCrud(stringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += '-updated';
                const replaced = await replaceById(toUpdate._id, toUpdate, createContext());
                expect(replaced.username).to.eql(toUpdate.username);
                expect(replaced._id).to.eql(toUpdate._id);
                expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
            });
            it('Should allow you to replace an existing entity with a valid entity when using the main identifier - stringId and tenant', async () => {
                const { replaceById, create } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += '-updated';
                const replaced = await replaceById(toUpdate._id, toUpdate, context);
                expect(replaced.username).to.eql(toUpdate.username);
                expect(replaced._id).to.eql(toUpdate._id);
                expect(replaced.versionInfo).to.not.eql(toUpdate.versionInfo);
            });
            it('Should not allow you to replace an existing entity if from a different tenant', async () => {
                const { replaceById, create } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const toUpdate = JSON.parse(JSON.stringify(created));
                toUpdate.username += '-updated';
                await expect(replaceById(toUpdate._id, toUpdate, createContext())).to.be.rejected;
            });
        });
        describe('Search', () => {
            it('Should allow you to search with just a filter', async () => {
                const { search, create } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = { filter: { username: entity.username } };
                const results = await search(query, createContext());
                expect(results).to.be.an('array');
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it('Should allow you to search if filter is passed through without the filter keyword', async () => {
                const { search, create } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = { username: entity.username };
                const results = await search(query, createContext());
                expect(results).to.be.an('array');
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it('Should allow you to search - no stringId or tenant', async () => {
                const { search, create, queryMapper } = await getPopulatedCrud(noStringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query, createContext());
                expect(results).to.be.an('array');
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it('Should allow you to search - stringId no tenant', async () => {
                const { search, create, queryMapper } = await getPopulatedCrud(stringIdNoTenant);
                const entity = validEntity();
                const created = await create(entity, createContext());
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query, createContext());
                expect(results).to.be.an('array');
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it('Should allow you to search - stringId and tenant', async () => {
                const { search, create, queryMapper } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                const context = createContext();
                const created = await create(entity, context);
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query, context);
                expect(results).to.be.an('array');
                expect(results).to.have.length(1);
                expect(results[0]).to.eql(created);
            });
            it('Should not return results from other tenants', async () => {
                const { search, create, queryMapper } = await getPopulatedCrud(stringIdTenant);
                const entity = validEntity();
                await create(entity, createContext());
                const query = queryMapper({ filter: { username: entity.username } });
                const results = await search(query, createContext());
                expect(results).to.be.an('array');
                expect(results).to.have.length(0);
            });
        });

        describe('Utilities', () => {
            describe('setStringIdentifier', () => {
                it('Should set the identifier from the source', async () => {
                    const { utilities } = await getPopulatedCrud(stringIdNoTenant);
                    const { setStringIdentifier } = utilities;
                    const entity = validEntity();
                    expect(entity.name).to.not.be.ok;
                    setStringIdentifier(entity);
                    expect(entity.name).to.be.ok;
                });
                it('Should not replace one if it already exists', async () => {
                    const { utilities } = await getPopulatedCrud(stringIdNoTenant);
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

/**
 * @param {()=>import('../entity-metadata/types').EntityMetadata} getMetadata a function to get the metadata
 * @returns {Promise<import('./mongodb-crud').GetCrud &{queryMapper:(queryString: string|object) => import('./types').Query}>}
 */
async function getPopulatedCrud(getMetadata) {
    const urlConfig = {
        server: 'localhost',
        dbName: 'test-common',
    };
    const db = await getDb(urlConfig);
    const inputValidator = createInputValidator(addMongoId);
    const outputValidator = createOutputValidator(addMongoId);
    const metadata = generateEntityMetadata(getMetadata(), inputValidator, outputValidator);
    const queryMapper = createQueryStringMapper(metadata.schemas.core);
    const crud = await getCrud({
        db,
        inputValidator,
        metadata,
        outputValidator,
    });
    return Object.assign(crud, { queryMapper });
}

/** @returns {import('../entity-metadata/types').EntityMetadata} */
function noStringIdNoTenant() {
    return {
        schemas: {
            core: {
                name: 'user',
                properties: {
                    username: {
                        type: 'string',
                    },
                },
                additionalProperties: false,
            },
        },
        identifier: { pathToId: '_id', schema: jsonSchemas.objectId },
        collectionName: 'crud-users',
        baseUrl: 'https://ryankotzen.com',
    };
}

/** @returns {import('../entity-metadata/types').EntityMetadata} */
function stringIdNoTenant() {
    return {
        schemas: {
            core: {
                name: 'user',
                properties: {
                    username: {
                        type: 'string',
                    },
                },
                additionalProperties: false,
            },
        },
        identifier: { pathToId: '_id', schema: jsonSchemas.objectId },
        stringIdentifier: {
            name: 'name',
            schema: schemas.identifier,
            entitySourcePath: 'username',
        },
        collectionName: 'crud-users',
        baseUrl: 'https://ryankotzen.com',
    };
}

/** @returns {import('../entity-metadata/types').EntityMetadata} */
function stringIdTenant() {
    return {
        schemas: {
            core: {
                name: 'user',
                properties: {
                    username: {
                        type: 'string',
                    },
                },
                additionalProperties: false,
            },
        },
        identifier: { pathToId: '_id', schema: jsonSchemas.objectId },
        stringIdentifier: {
            name: 'name',
            schema: schemas.identifier,
            entitySourcePath: 'username',
        },
        tenantInfo: {
            entityPathToId: 'tenantId',
            executionContextSourcePath: 'identity.tenant.id',
            title: 'Team',
            schema: {
                type: 'string',
            },
        },
        collectionName: 'crud-users',
        baseUrl: 'https://ryankotzen.com',
    };
}

function validEntity() {
    return {
        username: `bob-${randomString()}`,
    };
}

/** @returns {import('../version-info/types').ExecutionContext} */
function createContext() {
    return {
        requestId: randomString(),
        identity: {
            id: randomString(),
            tenant: {
                id: randomString(),
            },
        },
        codeVersion: '0.0.1',
        sourceIp: '127.0.0.1',
        source: 'tests',
    };
}
function randomString() {
    return crypto.randomBytes(20).toString('hex');
}
