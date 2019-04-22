'use strict';
module.exports = {
    'check-coverage': true,
    lines: 75,
    statements: 75,
    functions: 90,
    branches: 90,
    all: true,
    include: ['packages/**'],
    exclude: ['packages/**/*.test.js'],
    reporter: ['html', 'lcov', 'cobertura', 'text-summary'],
};
