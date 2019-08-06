'use strict';

const packageJson = require(`../../package.json`);
const logger = require(`../logging/logger`);

process.on(`uncaughtException`, function(err) {
    logger.error(`Unhandled Error on process : `, err);
    exitProcess(1);
});

process.on(`exit`, function() {
    logger.info(packageJson.name + ` is exiting`);
});

process.on(`SIGTERM`, function() {
    logger.info(`SIGTERM received stopping processing.`);
    exitProcess(0);
});

process.on(`SIGINT`, function() {
    logger.info(`SIGINT received stopping processing.`);
    exitProcess(0);
});

function exitProcess(code) {
    // eslint-disable-next-line no-process-exit
    process.exit(code);
}
