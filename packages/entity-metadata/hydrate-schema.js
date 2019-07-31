'use strict';
const {
    ensurePropsAndRequired,
    addFullRequiredSchema,
    addSchema,
} = require(`./json-schema-utilities`);
const withVersionInfo = require(`../version-info/with-version-info`);
const merge = require(`lodash/merge`);
const ownershipSchema = require(`./ownership-schema`);

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
    addOwnerInfo(schema, metadata);
    addStatusInfo(schema, metadata);
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

/**
 * @param {import('./types').JsonSchema} schema
 */
function addVersionInfo(schema) {
    return merge(schema, withVersionInfo());
}
/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').EntityMetadata} metadata
 */
function addOwnerInfo(schema, metadata) {
    if (!metadata.authorization || !metadata.authorization.ownership) {
        return;
    }
    addFullRequiredSchema(schema, `owner`, ownershipSchema(metadata));
}

/**
 * @param {import('./types').JsonSchema} schema
 * @param {import('./types').EntityMetadata} metadata
 */
function addStatusInfo(schema, metadata) {
    if (!metadata.statuses || metadata.statuses.length === 0) {
        return;
    }
    for (const definition of metadata.statuses) {
        // if (!definition.updateStatusSchema) {
        //     throw new Error(
        //         `Cannot have statuses array specified on the schema but not provide an updateStatusSchema property`
        //     );
        // }
        const statusNames = definition.allowedValues.map(status => status.name);
        const statusSchema = {
            type: `string`,
            enum: statusNames,
        };
        if (definition.isRequired) {
            addFullRequiredSchema(schema, definition.pathToStatusField, statusSchema);
        } else {
            addSchema(schema, definition.pathToStatusField, statusSchema);
        }
        // schema.properties.statusDate = {
        //     type: `string`,
        //     format: `date-time`,
        //     faker: `date.past`,
        // };
        // schema.properties.statusLog = {
        //     type: `array`,
        //     items: {
        //         type: `object`,
        //         properties: {
        //             status: schema.properties.status,
        //             statusDate: schema.properties.statusDate,
        //             data: schema.updateStatusSchema, //todo anyof?
        //         },
        //         required: [`status`, `statusDate`, `data`], //todo - data check schema anyof?
        //         additionalProperties: false,
        //     },
        //     additionalItems: false,
        // };
        // schema.required.push(`status`);
        // schema.required.push(`statusDate`);
        // schema.required.push(`statusLog`);
    }
}

module.exports = {
    hydrateSchema,
    addIdentifier,
    addStringIdentifier,
    addTenantInfo,
    addVersionInfo,
    addStatusInfo,
};
