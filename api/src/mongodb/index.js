'use strict';

const { getDb: _getDb } = require(`@bit/exigentcoder.common-modules.mongodb`);
const config = require(`../config/config`);

async function getDb() {
    //todo RK ensure indexes
    const mongoConfig = config.get(`mongoDb`);
    return await _getDb(mongoConfig.urlConfig, mongoConfig.clientOptions);
}

module.exports = { getDb };
