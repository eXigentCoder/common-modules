'use strict';
// NB: If you change this file, remember to change the tester bit package and republish it

const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

global.chai = chai;
global.expect = chai.expect;
global.assert = chai.assert;
