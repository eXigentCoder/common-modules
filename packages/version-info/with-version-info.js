'use strict';
const versionInfoSchema = require(`./version-info-schema`);

module.exports = function withVersionInfo() {
    return {
        properties: {
            versionInfo: versionInfoSchema,
        },
        required: [`versionInfo`],
    };
};
