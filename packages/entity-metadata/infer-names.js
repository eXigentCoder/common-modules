'use strict';

const _ = require('lodash');
const pluralize = require('pluralize');

/** @param {import("./types").EntityMetadata} metadata */
module.exports = function inferNames(metadata) {
    inferNamePlural(metadata);
    inferTitle(metadata);
    inferTitlePlural(metadata);
};

/** @param {import("./types").EntityMetadata} metadata */
function inferNamePlural(metadata) {
    metadata.namePlural = metadata.namePlural || pluralize.plural(metadata.name);
}

/** @param {import("./types").EntityMetadata} metadata */
function inferTitle(metadata) {
    metadata.title = metadata.title || metadata.schemas.core.title || _.startCase(metadata.name);
}

/** @param {import("./types").EntityMetadata} metadata */
function inferTitlePlural(metadata) {
    metadata.titlePlural = metadata.titlePlural || pluralize.plural(metadata.title);
}
