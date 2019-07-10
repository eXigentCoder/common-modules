'use strict';

const { ValidationError } = require(`../../../common-errors`);

function ensureEntityIsObject(entity, metadata) {
    if (entity === null || typeof entity !== `object`) {
        throw new ValidationError(
            `The ${metadata.title} value provided was not an object, type was :${typeof entity}`
        );
    }
}
module.exports = { ensureEntityIsObject };
