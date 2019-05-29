'use strict';

const azureWrapper = require('./azure-wrapper');
const createCrudVerbReqMap = require('./create-crud-verb-request-map');
const runRequestForVerb = require('./run-request-for-verb');

module.exports = { azureWrapper, createCrudVerbReqMap, runRequestForVerb };
