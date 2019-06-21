'use strict';

const createIndexes = require(`./indexes/create-indexes`);
const { getConnectedClient, getDb, buildMongoUrl, close } = require(`./connection`);
const createQueryStringMapper = require(`./query-string-mapper/query-string-to-mongo-query`);
const { getCrud, getUtils } = require(`./crud/mongodb-crud`);
const createAuditors = require(`./auditors/create-mongodb-auditors`);

module.exports = {
    createIndexes,
    getConnectedClient,
    getDb,
    createQueryStringMapper,
    getCrud,
    getUtils,
    createAuditors,
    buildMongoUrl,
    close,
};
