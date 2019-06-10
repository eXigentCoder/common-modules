'use strict';

module.exports = async function() {
    return new Promise(resolve => {
        setImmediate(() => {
            resolve([
                {
                    name: `bobby07`,
                },
                {
                    name: `bobby08`,
                },
            ]);
        });
    });
};
