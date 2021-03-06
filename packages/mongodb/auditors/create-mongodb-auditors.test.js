'use strict';

const crypto = require(`crypto`);
const { getDb, createAuditors } = require(`..`);
const { createInputValidator, createOutputValidator } = require(`../../validation`);
const { jsonSchemas, addMongoDbObjectId } = require(`../../validation-mongodb`);
const generateEntityMetadata = require(`../../entity-metadata`);
const ObjectId = require(`mongodb`).ObjectId;
const { createVersionInfoSetter } = require(`../../version-info`);
const cloneDeep = require(`lodash/cloneDeep`);

describe(`MongoDB`, () => {
    describe(`Auditors`, () => {
        describe(`Create`, () => {
            it(`should throw an error if the entity has no _id`, async () => {
                const { writeCreation, setVersionInfo } = await getAuditors();
                const context = createContext();
                const entity = setVersionInfo(validCreatedEntity(), context);
                await expect(writeCreation(entity, context)).to.be.rejected;
            });
            it(`should succeed`, async () => {
                const { writeCreation, setVersionInfo } = await getAuditors();
                const context = createContext();
                const entity = setVersionInfo(validCreatedEntity(), context);
                entity._id = new ObjectId();
                await writeCreation(entity, context);
            });
        });
        describe(`Delete`, () => {
            it(`should succeed for ObjectId object`, async () => {
                const { writeDeletion, setVersionInfo } = await getAuditors();
                const context = createContext();
                const entity = setVersionInfo(validCreatedEntity(), context);
                entity._id = new ObjectId();
                await writeDeletion(entity, context);
            });
        });
        describe(`replace`, () => {
            it(`should succeed for ObjectId object`, async () => {
                const { writeReplacement, setVersionInfo } = await getAuditors();
                const context = createContext();
                const entityBefore = setVersionInfo(validCreatedEntity(), context);
                entityBefore._id = new ObjectId();
                const entityAfter = cloneDeep(entityBefore);
                entityAfter.versionInfo.dateCreated = new Date(entityAfter.versionInfo.dateCreated);
                setVersionInfo(entityAfter, createContext());
                await writeReplacement(entityAfter, context);
            });
        });
    });
});

/**@returns {Promise<import('../types').Auditors<object> & {setVersionInfo:import('../../version-info/types').SetVersionInfo}>} */
async function getAuditors() {
    const urlConfig = {
        server: `localhost`,
        dbName: `test-common`,
    };
    const db = await getDb(urlConfig);
    const inputValidator = createInputValidator(addMongoDbObjectId);
    const outputValidator = createOutputValidator(addMongoDbObjectId);
    const inputMetadata = validMetaData();
    const metadata = generateEntityMetadata(inputMetadata, inputValidator, outputValidator);
    const setVersionInfo = createVersionInfoSetter({ metadata, validator: inputValidator });
    const auditors = await createAuditors(metadata, db);
    return Object.assign(auditors, { setVersionInfo });
}

/** @returns {import('../../entity-metadata').EntityMetadata} */
function validMetaData() {
    return {
        schemas: {
            core: {
                type: `object`,
                properties: {
                    firstName: {
                        type: `string`,
                    },
                    lastName: {
                        type: `string`,
                    },
                },
            },
        },
        name: `user`,
        identifier: { pathToId: `_id`, schema: jsonSchemas.mongoDbObjectId() },
        stringIdentifier: { pathToId: `username`, schema: { type: `string` } },
        collectionName: `users`,
        auditChanges: true,
        baseUrl: `https://ryankotzen.com`,
    };
}

function validCreatedEntity() {
    return {
        username: `bob-${randomString()}`,
        firstName: `bob`,
        lastName: `bobson`,
    };
}

function createContext() {
    return {
        requestId: randomString(),
        identity: {
            id: randomString(),
        },
        codeVersion: `0.0.1`,
        sourceIp: `127.0.0.1`,
        source: `tests`,
    };
}
function randomString() {
    return crypto.randomBytes(20).toString(`hex`);
}
