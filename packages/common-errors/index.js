'use strict';

const IsRequiredError = require('./is-required-error/is-required-error');
const ValidationError = require('./validation-error/validation-error');
const EntityNotFoundError = require('./entity-not-found-error/entity-not-found-error');
const KrimZenNinjaBaseError = require('./krimzen-ninja-base-error');

module.exports = {
    IsRequiredError,
    ValidationError,
    EntityNotFoundError,
    KrimZenNinjaBaseError,
};
