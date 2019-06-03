'use strict';

const _ = require('lodash');
const pluralize = require('pluralize');
const { IsRequiredError } = require('../common-errors');
/** @param {import("./types").EntityMetadata} metadata */
module.exports = function inferNames(metadata) {
    inferTitle(metadata);
    if (!metadata.title) {
        throw new IsRequiredError('schema.title', 'inferNames', null, { decorate: metadata });
    }
    inferTitlePlural(metadata);
    inferName(metadata);
    inferNamePlural(metadata);
};

/** @param {import("./types").EntityMetadata} metadata */
function inferTitle(metadata) {
    metadata.title = metadata.title || metadata.schemas.core.title || _.startCase(metadata.name);
}

/** @param {import("./types").EntityMetadata} metadata */
function inferTitlePlural(metadata) {
    metadata.titlePlural = metadata.titlePlural || pluralize.plural(metadata.title);
}

/** @param {import("./types").EntityMetadata} metadata */
function inferName(metadata) {
    metadata.name = metadata.name || _.kebabCase(metadata.title);
}

/** @param {import("./types").EntityMetadata} metadata */
function inferNamePlural(metadata) {
    metadata.namePlural = metadata.namePlural || _.startCase(metadata.titlePlural);
}
