'use strict';

/**
 * Returns a function you can use to map an item or array of items
 * @typedef {(itemOrItems: Object|Array<Object>) => void} MapOutput
 *
 * @param {string} schemaId The key used to refer to the schema in the outputValidator to use for the mapping
 * @param {import('./ajv').Validator} outputValidator the outputValidator instance
 * @returns {MapOutput} the function to use to map the output
 */
module.exports = function createOutputMapper(schemaId, outputValidator) {
    return function mapOutput(itemOrItems) {
        if (Array.isArray(itemOrItems)) {
            itemOrItems.forEach(item => {
                outputValidator.validate(schemaId, item);
            });
            return;
        }
        outputValidator.validate(schemaId, itemOrItems);
    };
};
