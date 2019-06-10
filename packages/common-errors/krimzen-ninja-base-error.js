'use strict';

class KrimZenNinjaBaseError extends Error {
    /**
     * Creates an instance of KrimZenNinjaBaseError.
     * @param {import("./types").BaseErrorParameters} params
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
            throw new Error(`message provided to KrimZenNinjaBaseError was falsy`);
        }
        if (!name) {
            throw new Error(`name provided to KrimZenNinjaBaseError was falsy`);
        }
        if (!codeSuffix) {
            throw new Error(`codeSuffix provided to KrimZenNinjaBaseError was falsy`);
        }
        super(message);
        this.name = name;
        /** A unique code to check the type of the error, even if the message changes */
        this.code = `ERR_KN_${codeSuffix}`;
        this.innerError = innerError;
        this.safeToShowToUsers = safeToShowToUsers;
        this.httpStatusCode = httpStatusCode;
        this.decorate = decorate;
    }

    toString(level = 0) {
        let message = `${this.name}: ${this.message}`;
        if (this.decorate) {
            message += ` ` + JSON.stringify(this.decorate, null, 0);
        }
        if (this.innerError) {
            message += `\n`;
            for (let i = 0; i <= level; i++) {
                message += `\t`;
            }
            // @ts-ignore
            message += this.innerError.toString(level + 1);
        }
        return message;
    }
}

module.exports = KrimZenNinjaBaseError;
