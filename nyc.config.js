'use strict';
module.exports = {
    'check-coverage': true,
    lines: 90,
    statements: 90,
    functions: 90,
    branches: 90,
    all: true,
    include: ['packages/**'],
    exclude: ['packages/**/*.test.js'],
    reporter: ['html', 'lcov', 'text-summary'],
};
