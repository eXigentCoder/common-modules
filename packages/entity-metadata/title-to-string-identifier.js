'use strict';
const v8n = require('v8n');
const kebabCase = require('lodash/kebabCase');

/**
 * @param {string} title
 * @returns {string}
 */
module.exports = function titleToStringIdentifier(title) {
    v8n()
        .string()
        .minLength(1)
        .not.pattern(/^\s*$/)
        .check(title);
    return kebabCase(title);
};
