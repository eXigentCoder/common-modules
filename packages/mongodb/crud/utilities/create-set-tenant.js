'use strict';

const get = require(`lodash/get`);
const set = require(`lodash/set`);
const { TenantError } = require(`../../../common-errors`);

/** @type {import('../../types').CreateSetTenant} */
function createSetTenant(metadata) {
    return function setTenant(entity, context) {
        if (!metadata.tenantInfo) {
            return;
        }
        const value = get(context, metadata.tenantInfo.executionContextSourcePath);
        if (!value) {
            throw new TenantError(metadata.tenantInfo.title);
        }
        set(entity, metadata.tenantInfo.entityPathToId, value);
    };
}

module.exports = { createSetTenant };
