'use strict';
module.exports = {
    'check-coverage': true,
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
    all: true,
    include: ['packages/**'],
    exclude: ['packages/**/*.test.js'],
    reporter: ['html', 'lcov', 'cobertura', 'text-summary'],
};
