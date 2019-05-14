'use strict';
const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

global.chai = chai;
global.expect = chai.expect;
global.assert = chai.assert;
//global.should = chai.should();
