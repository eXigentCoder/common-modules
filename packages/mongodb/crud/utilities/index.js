'use strict';

module.exports = {
    ...require(`./check-authorization-or-add-owner-to-filter`),
    ...require(`./check-authorization`),
    ...require(`./create-add-tenant-to-filter`),
    ...require(`./create-identifier-query`),
    ...require(`./create-set-tenant`),
    ...require(`./create-string-identifier-setter`),
    ...require(`./ensure-entity-is-object`),
    ...require(`./set-owner-if-applicable`),
    ...require(`./title-to-string-identifier`),
};
