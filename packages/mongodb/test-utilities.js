'use strict';

const { getDb, getCrud, createQueryStringMapper } = require(`.`);
const generateEntityMetadata = require(`../entity-metadata`);
const { createInputValidator, createOutputValidator } = require(`../validation`);
const { jsonSchemas, addMongoId } = require(`../validation-mongodb`);
const schemas = require(`../json-schema`);
const crypto = require(`crypto`);
const { newModel } = require(`casbin`);

const urlConfig = {
    server: `localhost`,
    dbName: `test-common`,
};
/**
 * @typedef {()=>import('../entity-metadata/types').EntityMetadata} GetMetadata;
 * @param {import('../entity-metadata/types').EntityMetadata | GetMetadata} getMetadata a function to get the metadata
 * @param {import('casbin').Enforcer} [enforcer]
 * @returns {Promise<import('./crud/mongodb-crud').GetCrud & { queryMapper:(queryString: string|object) => import('./types').Query }>}
 */
async function getPopulatedCrud(getMetadata, enforcer) {
    const db = await getDb(urlConfig);
    const inputValidator = createInputValidator(addMongoId);
    const outputValidator = createOutputValidator(addMongoId);
    const inputMetadata = typeof getMetadata === `function` ? getMetadata() : getMetadata;
    const metadata = generateEntityMetadata(inputMetadata, inputValidator, outputValidator);
    const queryMapper = createQueryStringMapper(metadata.schemas.core);
    const crud = await getCrud({
        db,
        inputValidator,
        metadata,
        outputValidator,
        enforcer,
    });
    return Object.assign(crud, { queryMapper });
}

function getRbacModel() {
    const model = newModel();
    model.addDef(`r`, `r`, `sub, obj, act`);
    model.addDef(`p`, `p`, `sub, obj, act`);
    model.addDef(`g`, `g`, `_, _`);
    model.addDef(`e`, `e`, `some(where (p.eft == allow))`);
    model.addDef(`m`, `m`, `g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act`);
    return model;
}

/** @returns {import('../entity-metadata/types').EntityMetadata} */
function noStringIdNoTenant() {
    return {
        schemas: {
            core: {
                properties: {
                    username: {
                        type: `string`,
                    },
                },
                additionalProperties: false,
            },
        },
        name: `user`,
        identifier: { pathToId: `_id`, schema: jsonSchemas.objectId },
        collectionName: `crud-users`,
        baseUrl: `https://ryankotzen.com`,
    };
}

/** @returns {import('../entity-metadata/types').EntityMetadata} */
function stringIdNoTenant() {
    return Object.assign({}, noStringIdNoTenant(), {
        stringIdentifier: {
            pathToId: `name`,
            schema: schemas.identifier,
            entitySourcePath: `username`,
        },
    });
}

/** @returns {import('../entity-metadata/types').EntityMetadata} */
function stringIdTenant() {
    return Object.assign({}, stringIdNoTenant(), {
        tenantInfo: {
            entityPathToId: `tenantId`,
            executionContextSourcePath: `identity.tenant.id`,
            title: `Team`,
            schema: {
                type: `string`,
            },
        },
    });
}

/** @returns {import('../entity-metadata/types').EntityMetadata} */
function stringIdNoTenantOwnership({
    initialOwner = `creator`,
    allowedActions = [`create`, `retrieve`, `delete`, `update`],
    idSchema = undefined,
    pathToId = undefined,
} = {}) {
    return Object.assign({}, stringIdNoTenant(), {
        authorization: {
            ownership: {
                initialOwner,
                allowedActions,
                idSchema,
                pathToId,
            },
        },
    });
}

/**
 *
 * @param {import('../entity-metadata/types').EntityMetadata} metadata
 * @returns {import('../entity-metadata/types').EntityMetadata}
 */
function withStatuses(
    metadata,
    { isRequired = true, pathToStatusField = `status`, dataRequired = true } = {}
) {
    /**@type {import('../entity-metadata/types').EntityMetadata} */
    // @ts-ignore
    const status = {
        statuses: [
            {
                allowedValues: [{ name: `todo` }, { name: `in progress ` }, { name: `done` }],
                isRequired,
                pathToStatusField,
                dataRequired,
            },
        ],
    };
    return Object.assign(status, metadata);
}

function validEntity() {
    return {
        username: `bob-${randomString()}`,
    };
}

/** @returns {import('../version-info/types').ExecutionContext} */
function createContext(id) {
    return {
        requestId: randomString(),
        identity: {
            id: id || randomString(),
            tenant: {
                id: randomString(),
            },
        },
        codeVersion: `0.0.1`,
        sourceIp: `127.0.0.1`,
        source: `tests`,
    };
}
function randomString() {
    return crypto.randomBytes(20).toString(`hex`);
}

module.exports = {
    getPopulatedCrud,
    getRbacModel,
    noStringIdNoTenant,
    stringIdNoTenant,
    stringIdTenant,
    validEntity,
    createContext,
    randomString,
    urlConfig,
    stringIdNoTenantOwnership,
    withStatuses,
};
