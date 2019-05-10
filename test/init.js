'use strict';
const chai = require('chai');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

global.chai = chai;
global.expect = chai.expect;
global.assert = chai.assert;
global.should = chai.should();
