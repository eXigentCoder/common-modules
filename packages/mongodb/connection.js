'use strict';

var MongoClient = require(`mongodb`).MongoClient;
const debug = require(`debug`)(`@exigentcoder/common-modules.mongodb`);

/** @type {import('mongodb').Db} */
let _db = null;
/** @type {import('mongodb').MongoClient} */
let _client = null;

/**
 * @param {import('./types').UrlConfig} urlConfig Config object used to build up the url.
 * @param {import('mongodb').MongoClientOptions} [options] Config object for connecting to mongodb
 * @returns {Promise<import('mongodb').Db>} The db instance
 */
async function getDb(urlConfig, options) {
    if (_db && _client && _db.serverConfig.isConnected()) {
        debug(`Using cached database instance`);
        return _db;
    }
    _db = null;
    _client = null;
    await connect(
        urlConfig,
        options
    );
    return _db;
}

/**
 * @returns {import('mongodb').MongoClient}  The mongo client with connections
 */
function getConnectedClient() {
    if (_db && _client && _db.serverConfig.isConnected()) {
        return _client;
    }
    _db = null;
    _client = null;
    return null;
}

/**
 * @param {import('./types').UrlConfig} urlConfig Config object used to build up the url.
 * @param {import('mongodb').MongoClientOptions} [options] Config object for connecting to mongodb
 */
async function connect(
    urlConfig,
    options = {
        useNewUrlParser: true,
    }
) {
    debug(`Creating new database instance`);
    const url = buildMongoUrl(urlConfig);
    const client = await MongoClient.connect(url, options);
    debug(`Connected to mongodb`);
    _db = client.db(urlConfig.dbName);
    debug(`Database cache set to ${urlConfig.dbName}`);
    _client = client;
}

/**
 * @param {import('./types').UrlConfig} urlConfig Config object used to build up the url.
 * @returns {string} The mongodb url
 */
function buildMongoUrl(urlConfig) {
    if (urlConfig.username && urlConfig.password) {
        return `mongodb://${urlConfig.username}:${encodeURIComponent(urlConfig.password)}@${
            urlConfig.server
        }`;
    }
    return `mongodb://${urlConfig.server}`;
}

async function close() {
    const client = getConnectedClient();
    if (!client) {
        return;
    }
    await client.close();
}

module.exports = {
    getConnectedClient,
    getDb,
    buildMongoUrl,
    close,
};
