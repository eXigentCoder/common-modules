'use strict';

const { dateTime } = require(`../json-schema`);
/**
 * @param {import("./types").EntityMetadata} metadata
 * @returns {import("./types").JsonSchema}
 */
function ownershipSchema(metadata) {
    return {
        type: `object`,
        additionalProperties: false,
        properties: {
            id: metadata.authorization.ownership.idSchema || metadata.identifier.schema,
            date: dateTime,
            log: {
                type: `array`,
                items: {
                    type: `object`,
                    properties: {
                        owner:
                            metadata.authorization.ownership.idSchema || metadata.identifier.schema,
                        date: dateTime,
                        reason: { type: `string` },
                    },
                    additionalProperties: true,
                    required: [`owner`, `date`],
                },
            },
        },
        required: [`id`, `date`, `log`],
    };
}
module.exports = ownershipSchema;
