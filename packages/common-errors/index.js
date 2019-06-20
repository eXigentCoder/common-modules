'use strict';

const IsRequiredError = require(`./is-required-error/is-required-error`);
const ValidationError = require(`./validation-error/validation-error`);
const EntityNotFoundError = require(`./entity-not-found-error/entity-not-found-error`);
const KrimZenNinjaBaseError = require(`./krimzen-ninja-base-error`);
const TenantError = require(`./tenant-error/tenant-error`);
const NotAuthorizedError = require(`./not-authorized-error/not-authorized-error`);

module.exports = {
    IsRequiredError,
    ValidationError,
    EntityNotFoundError,
    KrimZenNinjaBaseError,
    TenantError,
    NotAuthorizedError,
};
