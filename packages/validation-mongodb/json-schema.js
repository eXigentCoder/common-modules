'use strict';

/** a mongodb object id
 * @type {import("../entity-metadata/types").JsonSchema}*/
const objectId = {
    type: ['string', 'object'],
    format: 'mongoId',
    mongoId: true,
    faker: {
        'custom.mongoId': true,
    },
    minLength: 24,
    maxLength: 24,
    additionalProperties: true,
    properties: {
        _bsontype: {
            type: 'string',
            enum: ['ObjectID'],
        },
        id: {
            type: 'object',
        },
    },
    required: ['_bsontype', 'id'],
};

module.exports = { objectId };
