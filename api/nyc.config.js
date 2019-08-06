'use strict';
module.exports = {
    'check-coverage': true,
    statements: 0,
    branches: 0,
    functions: 0,
    lines: 0,
    all: true,
    include: [`src/**`],
    exclude: [`src/**/*.test.js`],
    reporter: [`html`, `lcov`, `cobertura`, `text-summary`],
};
