'use strict';

const get = require(`lodash/get`);
const set = require(`lodash/set`);
const { TenantError } = require(`../../../common-errors`);

/** @type {import('../../types').CreateAddTenantToFilter} */
function createAddTenantToFilter(metadata) {
    return function addTenantToFilter(query, context) {
        if (!metadata.tenantInfo) {
            return;
        }
        const value = get(context, metadata.tenantInfo.executionContextSourcePath);
        if (!value) {
            throw new TenantError(metadata.tenantInfo.title);
        }
        set(query, metadata.tenantInfo.entityPathToId, value);
    };
}

module.exports = { createAddTenantToFilter };
