'use strict';
const {
    ensurePropsAndRequired,
    addFullRequiredSchema,
    addSchema,
} = require(`./json-schema-utilities`);

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').EntityMetadata} metadata
 */
function hydrateSchema(schema, metadata) {
    ensurePropsAndRequired(schema);
    addIdentifier(schema, metadata);
    addStringIdentifier(schema, metadata);
    addTenantInfo(schema, metadata.tenantInfo);
    addVersionInfo(schema);
    // addStatusInfo(schema);
    // addOwnerInfo(schema);
}

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').EntityMetadata} metadata
 */
function addIdentifier(schema, metadata) {
    addFullRequiredSchema(schema, metadata.identifier.pathToId, metadata.identifier.schema);
}

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').EntityMetadata} metadata
 */
function addStringIdentifier(schema, metadata) {
    if (!metadata.stringIdentifier) {
        return;
    }
    addSchema(schema, metadata.stringIdentifier.pathToId, metadata.stringIdentifier.schema);
}

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').TenantInfo} tenantInfo
 */
function addTenantInfo(schema, tenantInfo) {
    if (!tenantInfo) {
        return;
    }
    addFullRequiredSchema(schema, tenantInfo.entityPathToId, tenantInfo.schema);
}

function addVersionInfo(schema) {}

// function addStatusInfo(schema) {
//     ensurePropsAndRequired(schema);
//     if (!schema.statuses) {
//         return;
//     }
//     if (!schema.updateStatusSchema) {
//         throw new Error(
//             'Cannot have statuses array specified on the schema but not provide an updateStatusSchema property'
//         );
//     }
//     const statusNames = schema.statuses.map(status => status.name);
//     schema.properties.status = {
//         type: 'string',
//         enum: statusNames,
//     };
//     schema.properties.statusDate = {
//         type: 'string',
//         format: 'date-time',
//         faker: 'date.past',
//     };
//     schema.properties.statusLog = {
//         type: 'array',
//         items: {
//             type: 'object',
//             properties: {
//                 status: schema.properties.status,
//                 statusDate: schema.properties.statusDate,
//                 data: schema.updateStatusSchema, //todo anyof?
//             },
//             required: ['status', 'statusDate', 'data'], //todo - data check schema anyof?
//             additionalProperties: false,
//         },
//         additionalItems: false,
//     };
//     schema.required.push('status');
//     schema.required.push('statusDate');
//     schema.required.push('statusLog');
// }

// function addOwnerInfo(schema) {
//     ensurePropsAndRequired(schema);
//     if (!schema.ownership) {
//         return;
//     }
//     schema.properties.owner = {
//         type: 'string',
//         format: 'mongoId',
//         mongoId: true,
//         minLength: 24,
//         maxLength: 24,
//     };
//     schema.properties.ownerDate = {
//         type: 'string',
//         format: 'date-time',
//         faker: 'date.past',
//     };
//     schema.properties.ownerLog = {
//         type: 'array',
//         items: {
//             type: 'object',
//             properties: {
//                 owner: schema.properties.owner,
//                 ownerDate: schema.properties.ownerDate,
//                 data: {
//                     type: ['object', 'string'], //todo?
//                 },
//             },
//             required: ['owner', 'ownerDate', 'data'], //todo - data check schema anyof?
//             additionalProperties: false,
//         },
//         additionalItems: false,
//     };
//     schema.required.push('owner');
//     schema.required.push('ownerDate');
//     schema.required.push('ownerLog');
// }
module.exports = {
    hydrateSchema,
    addIdentifier,
    addStringIdentifier,
    addTenantInfo,
    addVersionInfo,
};
