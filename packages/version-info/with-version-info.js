'use strict';

const versionInfoSchema = require('./version-info-schema');

module.exports.withVersionInfo = function() {
    return {
        properties: {
            versionInfo: versionInfoSchema,
        },
        //todo RK should required be here?
    };
};
