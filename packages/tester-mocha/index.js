'use strict';

require(`./test-init`);
const { JSDOM } = require(`jsdom`);
const convertMochaFormatToBitFormat = require(`./resultsAdapter`);
const Mocha = require(`mocha`);
const JSONReporter = require(`./jsonReporter`);
require(`ignore-styles`);
const { document } = new JSDOM(`<!doctype html><html><body></body></html>`).window;

global.window = document.defaultView;
global.document = document;
global.navigator = {
    userAgent: `node.js`,
};

function run(specFile) {
    console.log(specFile);
    return new Promise(resolve => {
        const mocha = new Mocha({
            reporter: JSONReporter,
            retries: 0,
            timeout: 30000,
            bail: true,
            inlineDiffs: false,
            enableTimeouts: true,
            fullStackTrace: true,
        });
        mocha.addFile(specFile);
        mocha
            .run(function(failures) {
                process.exitCode = failures ? 1 : 0; // exit with non-zero status if there were failures
            })
            .on(`end`, function() {
                return resolve(convertMochaFormatToBitFormat(this.testResults));
            });
    });
}

module.exports = {
    run,
    globals: {},
};
// For testing (Can't use mocha to kick off mocha...) :
//testRunner.run('./packages/tester-mocha/simple.test.js');
