'use strict';

module.exports = {
    write: function destination(message) {
        try {
            const obj = JSON.parse(message);
            if (obj.level >= 40) {
                return console.error(obj);
            }
            console.log(obj);
        } catch (err) {
            console.log(message.trim());
        }
    },
};
