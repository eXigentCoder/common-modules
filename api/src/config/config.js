'use strict';

const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const config = require('@bit/exigentcoder.common-modules.config');
const pacakgeJson = require('../../package.json');

const myEnv = dotenv.config();
dotenvExpand(myEnv);
config.initialise({
    name: pacakgeJson.name,
    envOptions: {
        separator: '__',
        parseValues: true,
    },
});

module.exports = config;
