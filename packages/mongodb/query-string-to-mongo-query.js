'use strict';

const ObjectId = require('mongodb').ObjectID;
const aqp = require('api-query-params');
const set = require('lodash/set');
/**
 * @typedef {import('./types').Query} Query
 */

const defaultOptions = {
    projection: {},
    skip: 0,
    limit: 50,
    sort: {},
};
/**
 * @param {Object} schema The schema representing the object in the db
 * @param {import('./types').QueryStringMapperOptions} options The options to use when creating the query string mapper
 * @returns {(queryString: string|Object) => Query} The resultant query to run against MongoDB
 */
module.exports = function createQueryStringMapper(schema, options = defaultOptions) {
    return function(queryString) {
        if (options.skip === undefined || options.skip === null) {
            options.skip = defaultOptions.skip;
        }
        if (options.limit === undefined || options.limit === null) {
            options.limit = defaultOptions.limit;
        }
        if (!options.projection) {
            options.projection = {};
        }
        if (!options.sort) {
            options.sort = {};
        }
        const agpOptions = Object.assign(
            {},
            {
                casters: {
                    mongoId: val => new ObjectId(val),
                },
                castParams: {
                    _id: 'mongoId',
                    owner: 'mongoId',
                },
            },
            options.agpOptions
        );
        setCastParamsFromSchema(agpOptions, schema.properties);
        let qsToUse;
        if (typeof queryString === 'string') {
            qsToUse = queryString;
        } else if (queryString && typeof queryString === 'object') {
            if (queryString.filter) {
                queryString.filter = flatten(queryString.filter);
            } else {
                queryString = flatten(queryString);
            }
            qsToUse = queryString;
        } else {
            throw new Error(
                `QueryString should have been a string or object but was ${typeof queryString}`
            );
        }
        /** @type Query */
        // @ts-ignore
        const parsedQuery = aqp(qsToUse, agpOptions);
        parsedQuery.projection = parsedQuery.projection || options.projection;
        if (parsedQuery.skip === undefined || parsedQuery.skip === null) {
            parsedQuery.skip = options.skip;
        }
        if (parsedQuery.limit === undefined || parsedQuery.limit === null) {
            parsedQuery.limit = options.limit;
        }
        parsedQuery.sort = parsedQuery.sort || options.sort;
        return parsedQuery;
    };
};

function setCastParamsFromSchema(agpOptions, properties, prefix = '') {
    Object.getOwnPropertyNames(properties).forEach(function(propertyName) {
        const propertyValue = properties[propertyName];
        if (!propertyValue.type) {
            return;
        }
        if (Array.isArray(propertyValue.type)) {
            const types = propertyValue.type.filter(type => type.toLowerCase() !== 'null');
            if (types.length === 1) {
                agpOptions.castParams[`${prefix + propertyName}`] = types[0];
                return;
            }
            console.warn(`Multiple types (${types}) found for property ${prefix + propertyName}`);
            return;
        }
        if (propertyValue.type.toLowerCase() === 'object') {
            setCastParamsFromSchema(
                agpOptions,
                propertyValue.properties,
                `${prefix + propertyName}.`
            );
            return;
        }
        if (agpOptions.castParams[`${prefix + propertyName}`]) {
            return; //don't override
        }
        agpOptions.castParams[`${prefix + propertyName}`] = propertyValue.type;
    });
    return agpOptions;
}

//adapted from https://gist.github.com/kirbysayshi/2ea881ebe643458311f4
function flatten(obj, opt_out, opt_paths) {
    var out = opt_out || {};
    var paths = opt_paths || [];
    return Object.getOwnPropertyNames(obj).reduce(function(out, key) {
        paths.push(key);
        const value = obj[key];
        if (typeof value === 'object' && !(value instanceof RegExp)) {
            if (key[0] === '$') {
                set(out, paths.join('.'), value);
            } else if (
                typeof value === 'object' &&
                Object.getOwnPropertyNames(value)[0][0] === '$'
            ) {
                out[paths.join('.')] = value;
            } else {
                flatten(value, out, paths);
            }
        } else {
            out[paths.join('.')] = value;
        }
        paths.pop();
        return out;
    }, out);
}
