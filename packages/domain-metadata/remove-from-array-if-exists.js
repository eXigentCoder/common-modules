'use strict';

module.exports = function removeFromArrayIfExists(array, item) {
    if (!array) {
        return;
    }
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
};
