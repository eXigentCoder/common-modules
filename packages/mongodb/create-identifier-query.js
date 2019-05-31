'use strict';

const ObjectId = require('mongodb').ObjectID;
const util = require('util');
const { ValidationError } = require('../common-errors');
/**
 * @typedef {import('../entity-metadata').EntityMetadata} EntityMetadata
 * @typedef {(identifier: string|object) => object} GetIdentifierQuery
 *
 * @param {EntityMetadata} metadata The entity metadata containing the rules for identifiers
 * @returns {GetIdentifierQuery} The function to set the get the right mongodb query based on the type of supplied identifier
 */
module.exports = function createGetIdentifierQuery(metadata) {
    const { stringIdentifier, identifier } = metadata;

    return function getIdentifierQuery(identifierValue) {
        let identifierNameString = stringIdentifier
            ? `${identifier.name} or ${stringIdentifier.name}`
            : `${identifier.name}`;
        if (identifierValue === null || identifierValue === undefined) {
            throw new ValidationError(
                `${identifierNameString} is required as an identifier to refer to a ${
                    metadata.title
                }`
            );
        }
        if (typeof identifierValue === 'number') {
            throw new ValidationError(
                `${identifierNameString} cannot be a number when used to refer to a ${
                    metadata.title
                }`
            );
        }
        if (ObjectId.isValid(identifierValue)) {
            return { _id: new ObjectId(identifierValue) };
        }

        if (typeof identifierValue === 'object') {
            throw new ValidationError(
                `${identifierNameString} cannot be an object when used to refer to a ${
                    metadata.title
                }`
            );
        }
        if (typeof identifierValue === 'string' && stringIdentifier) {
            const identifierQuery = {};
            identifierQuery[stringIdentifier.name] = identifierValue;
            return identifierQuery;
        }
        throw new ValidationError(
            `${
                identifierNameString
            } was an invalid type: "${typeof identifierValue}", value: "${util.inspect(
                identifierValue
            )}" when trying to refer to a ${metadata.title}, must be a string or ObjectId`
        );
    };
};
