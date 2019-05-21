'use strict';

const kebabCase = require('lodash/kebabCase');

module.exports = function titleToStringIdentifier(title) {
    return kebabCase(title);
};
