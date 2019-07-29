'use strict';

//todo should move to lib
module.exports = ajv => {
    ajv.addKeyword('firebaseTimestamp', {
        validate: validateAndCoerce,
    });
};

function validateAndCoerce(
    keywordValue,
    dataValue,
    schema,
    currentDataPath,
    parentDataObject,
    propName
) {
    if (dataValue.toDate) {
        parentDataObject[propName] = dataValue.toDate();
    }
    return true;
}
