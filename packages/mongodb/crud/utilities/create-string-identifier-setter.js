'use strict';

const get = require(`lodash/get`);
const set = require(`lodash/set`);

/**
 * @param {import('../../../entity-metadata/types').EntityMetadata} metadata The entity metadata containing the rules for the string identifier
 * @returns {import('../../types').SetStringIdentifier} The function to set the string identifier on an object
 */
function createStringIdentifierSetter(metadata, titleToStringIdentifier) {
    return function setStringIdentifier(item) {
        if (!metadata.stringIdentifier) {
            return;
        }
        if (metadata.stringIdentifier.entitySourcePath) {
            const currentValue = get(item, metadata.stringIdentifier.pathToId);
            if (currentValue) {
                return;
            }
            const newValue = titleToStringIdentifier(
                get(item, metadata.stringIdentifier.entitySourcePath)
            );
            set(item, metadata.stringIdentifier.pathToId, newValue);
        }
    };
}

module.exports = { createStringIdentifierSetter };
