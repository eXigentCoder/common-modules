'use strict';

const { JSDOM } = require('jsdom');
const convertMochaFormatToBitFormat = require('./resultsAdapter');
const Mocha = require('mocha');
const JSONReporter = require('./jsonReporter');
require('ignore-styles');
const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { document } = new JSDOM('<!doctype html><html><body></body></html>').window;

global.window = document.defaultView;
global.document = document;
global.navigator = {
    userAgent: 'node.js',
};
global.chai = chai;
global.expect = chai.expect;
global.assert = chai.assert;

function run(specFile) {
    console.log(specFile);
    return new Promise(resolve => {
        const mocha = new Mocha({
            reporter: JSONReporter,
            retries: 0,
            timeout: 5000,
            bail: true,
            inlineDiffs: false,
        });
        mocha.addFile(specFile);
        mocha
            .run(function(failures) {
                process.exitCode = failures ? 1 : 0; // exit with non-zero status if there were failures
            })
            .on('end', function() {
                // eslint-disable-line
                return resolve(convertMochaFormatToBitFormat(this.testResults));
            });
    });
}

module.exports = {
    run,
    globals: {
        chai,
        expect: chai.expect,
        assert: chai.assert,
        should: chai.should(),
    },
};
