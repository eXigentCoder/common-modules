'use strict';
const v8n = require(`v8n`);
const kebabCase = require(`lodash/kebabCase`);

/** @type {import("../../types").TitleToStringIdentifier} */
function titleToStringIdentifier(title) {
    v8n()
        .string()
        .minLength(1)
        .not.pattern(/^\s*$/)
        .check(title);
    return kebabCase(title);
}

module.exports = { titleToStringIdentifier };
