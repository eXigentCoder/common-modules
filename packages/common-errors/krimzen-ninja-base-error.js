'use strict';

/**
 * @typedef {Object} BaseErrorParameters
 * @property {string} message The error message
 * @property {string} name The name of the error
 * @property {string} codeSuffix The suffix to append to the error code for internationalisation etc
 * @property {Error} [innerError] An inner error if applicable
 * @property {boolean} [safeToShowToUsers=false] Specifies if the details in this error, including the decoration properties safe to show to a user?
 * @property {number} [httpStatusCode] The resultant httpStatus Code should this error go unhandled
 * @property {Object} [decorate] An object with additional properties to include in the error object
 *
 * @typedef {Object} ErrorParameters
 * @property {Error} [innerError] An inner error if applicable
 * @property {boolean} [safeToShowToUsers=false] Specifies if the details in this error, including the decoration properties safe to show to a user?
 * @property {Object} [decorate] An object with additional properties to include in the error object
 */

/**
 * @class KrimZenNinjaBaseError
 * @extends {Error}
 */
class KrimZenNinjaBaseError extends Error {
    /**
     * Creates an instance of KrimZenNinjaBaseError.
     * @param {BaseErrorParameters} params
     * @memberof KrimZenNinjaBaseError
     */
    constructor({
        message,
        name,
        codeSuffix,
        innerError,
        decorate,
        safeToShowToUsers = false,
        httpStatusCode = 500,
    }) {
        if (!message) {
            throw new Error('message provided to KrimZenNinjaBaseError was falsy');
        }
        if (!name) {
            throw new Error('name provided to KrimZenNinjaBaseError was falsy');
        }
        if (!codeSuffix) {
            throw new Error('codeSuffix provided to KrimZenNinjaBaseError was falsy');
        }
        super(message);
        this.name = name;
        this.code = `ERR_KN_${codeSuffix}`;
        this.innerError = innerError;
        this.safeToShowToUsers = safeToShowToUsers;
        this.httpStatusCode = httpStatusCode;
        this.decorate = decorate;
    }

    toString(level = 0) {
        let message = `${this.name}: ${this.message}`;
        if (this.decorate) {
            message += ' ' + JSON.stringify(this.decorate, null, 0);
        }
        if (this.innerError) {
            message += '\n';
            for (let i = 0; i <= level; i++) {
                message += '\t';
            }
            // @ts-ignore
            message += this.innerError.toString(level + 1);
        }
        return message;
    }
}

module.exports = KrimZenNinjaBaseError;
