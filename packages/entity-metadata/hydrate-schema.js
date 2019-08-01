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
        definition.pathToStatusDateField =
            definition.pathToStatusDateField || `${definition.pathToStatusField}Date`;
        definition.pathToStatusLogField =
            definition.pathToStatusLogField || `${definition.pathToStatusField}Log`;
        definition.pathToStatusDataField =
            definition.pathToStatusDataField || `${definition.pathToStatusField}Data`;
        const statusNames = definition.allowedValues.map(status => status.name);
        /**@type {import('./types').JsonSchema} */
        const statusSchema = {
            type: `string`,
            enum: statusNames,
        };
        /**@type {import('./types').JsonSchema} */
        const dateSchema = {
            type: `string`,
            format: `date-time`,
            faker: `date.past`,
        };
        /**@type {import('./types').JsonSchema} */
        const logSchema = {
            type: `array`,
            items: {
                type: `object`,
                properties: {
                    status: statusSchema,
                    statusDate: dateSchema,
                    data: definition.updateStatusSchema || {
                        // eslint-disable-next-line node/no-unsupported-features/es-syntax
                        type: [`object`, `string`, `null`],
                    },
                },
                required: [`status`, `statusDate`],
                additionalProperties: false,
            },
            additionalItems: false,
        };
        if (definition.updateStatusSchema) {
            logSchema.items.required.push(`data`);
        }
        if (definition.isRequired) {
            addFullRequiredSchema(schema, definition.pathToStatusField, statusSchema);
            addFullRequiredSchema(schema, definition.pathToStatusDateField, dateSchema);
            addFullRequiredSchema(schema, definition.pathToStatusLogField, logSchema);
        } else {
            addSchema(schema, definition.pathToStatusField, statusSchema);
            addSchema(schema, definition.pathToStatusDateField, dateSchema);
            addSchema(schema, definition.pathToStatusLogField, logSchema);
        }
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
