'use strict';
// NB: If you change this file, remember to change the tester bit package and republish it

const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-string'));

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

global.chai = chai;
global.expect = chai.expect;
global.assert = chai.assert;
