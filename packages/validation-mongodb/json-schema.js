'use strict';

//TODO RK, maybe a good idea to use oneOf here?

/** a mongodb object id
 * @param {import("../entity-metadata/types").MongoDbObjectIdCoercion} coerceTo
 * @returns {import("../entity-metadata/types").JsonSchema}*/
function mongoDbObjectId(coerceTo = `object`) {
    return {
        type: [`string`, `object`],
        format: `mongoDbObjectId`,
        mongoDbObjectIdCoercion: coerceTo,
        minLength: 24,
        maxLength: 24,
        additionalProperties: true,
        properties: {
            _bsontype: {
                type: `string`,
                enum: [`ObjectID`],
            },
            id: {
                type: `object`,
            },
        },
        required: [`_bsontype`, `id`],
    };
}

module.exports = { mongoDbObjectId };
