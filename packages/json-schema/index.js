'use strict';

/** a v4 unique identifier
 * @type {import("../entity-metadata/types").JsonSchema}*/
const uuid = {
    type: `string`,
    format: `uuid`,
    minLength: 36,
    maxLength: 36,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const identifier = {
    description: `A human readable string identifier used to refer to an entitiy`,
    type: `string`,
    minLength: 1,
    pattern: convertRegexToAjvString(/^[a-zA-Z0-9-_]+$/),
};

/** the name of the entity as displayed to a human
 * @type {import("../entity-metadata/types").JsonSchema}*/
const title = {
    type: `string`,
    minLength: 1,
    pattern: convertRegexToAjvString(/^[a-zA-Z0-9- ]+$/),
};

/**@type {import("../entity-metadata/types").JsonSchema} */
const numberString = {
    type: `string`,
    minLength: 1,
    pattern: convertRegexToAjvString(/^[0-9]+$/),
};

/** A description of the entity
 * @type {import("../entity-metadata/types").JsonSchema}*/
const description = {
    type: `string`,
    pattern: convertRegexToAjvString(/^[a-zA-Z0-9-\s]*$/),
};
/** @type {import("../entity-metadata/types").JsonSchema}*/
const uniqueStringArray = {
    type: `array`,
    items: {
        type: `string`,
        minLength: 1,
    },
    additionalItems: false,
    minItems: 1,
    uniqueItems: true,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const nonEmptyString = {
    type: `string`,
    minLength: 1,
    pattern: convertRegexToAjvString(/^(?!\s*$).+/),
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const oneEmailAddress = {
    type: `string`,
    format: `email`,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const oneOrMoreEmailAddresses = {
    oneOf: [
        {
            type: `array`,
            items: oneEmailAddress,
        },
        oneEmailAddress,
    ],
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const dateTime = {
    type: [`string`, `object`],
    format: `date-time`,
    coerceFromFormat: true,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const date = {
    type: `string`,
    format: `date`,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const time = {
    type: `string`,
    format: `time`,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const base64EncodedString = {
    type: `string`,
    pattern: convertRegexToAjvString(
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
    ),
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const integer = {
    type: `integer`,
    multipleOf: 1.0,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const positiveInteger = Object.assign({ minimum: 0 }, integer);

/** @type {import("../entity-metadata/types").JsonSchema}*/
const positiveNonZeroInteger = Object.assign({ minimum: 1 }, integer);

/** @type {import("../entity-metadata/types").JsonSchema}*/
const number = {
    type: `number`,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const positiveNumber = Object.assign({ minimum: 0 }, number);

/** @type {import("../entity-metadata/types").JsonSchema}*/
const positiveNonZeroNumber = Object.assign({ minimum: 1 }, number);

/** @type {import("../entity-metadata/types").JsonSchema}*/
const url = {
    type: `string`,
    format: `uri`,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const alpha = {
    type: `string`,
    pattern: convertRegexToAjvString(/^[a-zA-Z]*$/),
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const nonEmptyAlpha = {
    type: `string`,
    minLength: 1,
    pattern: convertRegexToAjvString(/^[a-zA-Z]+$/),
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const ipV4 = {
    type: `string`,
    format: `ipv4`,
};

/** @type {import("../entity-metadata/types").JsonSchema}*/
const boolean = {
    type: `boolean`,
};

module.exports = {
    uuid,
    identifier,
    title,
    description,
    dateTime,
    date,
    time,
    uniqueStringArray,
    oneEmailAddress,
    oneOrMoreEmailAddresses,
    numberString,
    base64EncodedString,
    integer,
    positiveInteger,
    positiveNonZeroInteger,
    url,
    alpha,
    nonEmptyAlpha,
    nonEmptyString,
    ipV4,
    boolean,
    number,
    positiveNumber,
    positiveNonZeroNumber,
    convertRegexToAjvString,
};

function convertRegexToAjvString(regex) {
    let string = regex.toString();
    const str = string.substr(1, string.length - 2);
    return str;
}
