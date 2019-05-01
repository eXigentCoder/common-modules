'use strict';

// a mongodb object id
const objectId = {
    type: ['string', 'object'],
    format: 'mongoId',
    mongoId: true,
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
