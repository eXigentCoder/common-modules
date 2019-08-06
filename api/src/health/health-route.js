'use strict';

const config = require(`../config/config`);
const packageJson = require(`../../package.json`);
const logger = require(`../logging/logger`);
const moment = require(`moment`);
const express = require(`express`);
const expressOptions = config.get(`expressApp`);
const router = express.Router(expressOptions.routerOptions);

module.exports = router;

router.all(`/`, function(req, res) {
    const humanReadableUptime = moment
        .utc()
        .subtract(process.uptime(), `seconds`)
        .fromNow();
    const appInfo = {
        appName: packageJson.name,
        version: packageJson.version,
        deploymentHash: packageJson.deploymentHash,
        deploymentDate: packageJson.deploymentDate,
        environment: config.get(`NODE_ENV`),
        uptime: process.uptime(),
        humanReadableUptime: humanReadableUptime,
    };
    logger.info(appInfo);
    return res.status(200).json(appInfo);
});
