'use strict';

const Ajv = require(`ajv`);
const addCustomErrors = require(`ajv-errors`);
const betterAjvErrors = require(`better-ajv-errors`);
const ValidationError = require(`../common-errors/validation-error/validation-error`);
const util = require(`util`);

/**
 * @typedef {(schemaId:string, data:object)=>void} EnsureValid
 * @typedef {import('ajv').Ajv & {ensureValid:EnsureValid}} Validator
 * @typedef {(validator:import('ajv').Ajv)=>void} CustomKeywordFunction
 * */

/**
 * Takes in an AJV instance andd adds the ensureValid function on to it.
 * @param {import('ajv').Ajv } validator
 * @throws {ValidationError} An error if the data is invalid
 */
function addEnsureValid(validator) {
    //@ts-ignore
    validator.ensureValid = ensureValid;
    /**@type EnsureValid */
    function ensureValid(schemaId, data) {
        var valid = validator.validate(schemaId, data);
        if (!valid) {
            const schema = validator.getSchema(schemaId);
            if (data === null || data === undefined) {
                throw new ValidationError(getErrorMessage(), null, schema);
            }
            /** @type {import('better-ajv-errors').IInputOptions} */
            const options = {
                format: `js`,
            };
            let betterErrors;
            try {
                betterErrors = betterAjvErrors(schema, data, validator.errors, options);
            } catch (err) {
                console.error(err);
                throw new ValidationError(getErrorMessage(), null, schema, data);
            }
            throw new ValidationError(getErrorMessage(), betterErrors, schema, data);
        }
        function getErrorMessage() {
            return `Data does not match schema "${schemaId}": ${validator.errorsText(
                validator.errors
            )}`;
        }
    }
}

/**
 * Create a validator that can be used to validate incoming objects. Will not remove additional properties which fail validation.
 * @param {CustomKeywordFunction[]} [functions]
 * @returns {Validator}
 */
function createInputValidator(...functions) {
    return createValidator(
        {
            allErrors: true,
            verbose: false,
            format: `full`,
            jsonPointers: true,
            removeAdditional: false,
            useDefaults: true,
            coerceTypes: false,
        },
        ...functions
    );
}

/**
 * Create a validator that can be used to transform outgoing objects. Will remove additional properties which fail validation.
 * @param {CustomKeywordFunction[]} [functions]
 * @returns {Validator}
 */
function createOutputValidator(...functions) {
    return createValidator(
        {
            allErrors: true,
            verbose: false,
            format: `full`,
            jsonPointers: true,
            removeAdditional: `failing`,
            useDefaults: true,
            coerceTypes: true,
        },
        ...functions
    );
}

/**
 * @param {import('ajv').Options} ajvOptions
 * @param {CustomKeywordFunction[]} [functions]
 * @returns {Validator}
 */
function createValidator(ajvOptions, ...functions) {
    const validator = new Ajv(ajvOptions);
    addCustomErrors(validator);
    addEnsureValid(validator);
    functions.forEach(fn => fn(validator));
    //@ts-ignore
    return validator;
}

module.exports = { createInputValidator, createOutputValidator, createValidator };
