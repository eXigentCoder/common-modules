'use strict';

// a v4 unique identifier
const uuid = {
    type: 'string',
    format: 'uuid',
    minLength: 36,
    maxLength: 36,
};

const identifier = {
    description: 'A human readable string identifier used to refer to an entitiy',
    type: 'string',
    minLength: 1,
    pattern: convertRegexToAjvString(/^[a-zA-Z0-9-_]+$/),
};

// the name of the entity as displayed to a human
const title = {
    type: 'string',
    minLength: 1,
    pattern: convertRegexToAjvString(/^[a-zA-Z0-9- ]+$/),
};

const numberString = {
    type: 'string',
    minLength: 1,
    pattern: convertRegexToAjvString(/^[0-9]+$/),
};

// a description of the entity
const description = {
    type: 'string',
    pattern: convertRegexToAjvString(/^[a-zA-Z0-9-\s]*$/),
};

const uniqueStringArray = {
    type: 'array',
    items: {
        type: 'string',
        minLength: 1,
    },
    additionalItems: false,
    minItems: 1,
    uniqueItems: true,
};

const nonEmptyString = {
    type: 'string',
    minLength: 1,
    pattern: convertRegexToAjvString(/^(?!\s*$).+/),
};

const oneEmailAddress = {
    type: 'string',
    format: 'email',
};

const oneOrMoreEmailAddresses = {
    oneOf: [
        {
            type: 'array',
            items: oneEmailAddress,
        },
        oneEmailAddress,
    ],
};

const dateTime = {
    type: 'string',
    format: 'date-time',
    firebaseTimestamp: true,
};

const date = {
    type: 'string',
    format: 'date',
};

const time = {
    type: 'string',
    format: 'time',
};

const base64EncodedString = {
    type: 'string',
    pattern: convertRegexToAjvString(
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
    ),
};

const integer = {
    type: 'integer',
    multipleOf: 1.0,
};

const positiveInteger = Object.assign({ minimum: 0 }, integer);

const positiveNonZeroInteger = Object.assign({ minimum: 1 }, integer);

const number = {
    type: 'number',
};
const positiveNumber = Object.assign({ minimum: 0 }, number);

const positiveNonZeroNumber = Object.assign({ minimum: 1 }, number);
const url = {
    type: 'string',
    format: 'uri',
};

const alpha = {
    type: 'string',
    pattern: convertRegexToAjvString(/^[a-zA-Z]*$/),
};

const nonEmptyAlpha = {
    type: 'string',
    minLength: 1,
    pattern: convertRegexToAjvString(/^[a-zA-Z]+$/),
};
const ipV4 = {
    type: 'string',
    format: 'ipv4',
};

const boolean = {
    type: 'boolean',
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
