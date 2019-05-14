'use strict';

const createIndexes = require('./create-indexes');
const { getClient, getDb } = require('./connection');

module.exports = {
    createIndexes,
    getClient,
    getDb,
};
