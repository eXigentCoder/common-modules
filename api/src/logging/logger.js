'use strict';

const config = require('../config/config');
const pacakgeJson = require('../../package.json');
const logger = require('@bit/exigentcoder.common-modules.logging');
const consoleDest = require('./console-destination');
const logOptions = config.get('logging');
logger.initialise(
    {
        name: pacakgeJson.name,
        ...logOptions.pino,
    },
    //@ts-ignore
    consoleDest
);

module.exports = logger;
