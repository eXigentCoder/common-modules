'use strict';
const chai = require(`chai`);
require(`./src/config/config`);
require(`./src/logging/logger`);
var chaiAsPromised = require(`chai-as-promised`);

chai.use(chaiAsPromised);
const util = require(`util`);

util.inspect.defaultOptions.showHidden = false;
util.inspect.defaultOptions.depth = 10;

process.env.NODE_ENV = process.env.NODE_ENV || `test`;

global.chai = chai;
global.expect = chai.expect;
global.assert = chai.assert;
//global.should = chai.should();
