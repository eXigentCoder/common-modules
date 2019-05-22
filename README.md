[![Build Status](https://dev.azure.com/krimzen-ninja/Common%20Modules/_apis/build/status/eXigentCoder.common-modules?branchName=master)](https://dev.azure.com/krimzen-ninja/Common%20Modules/_build/latest?definitionId=1&branchName=master)

# bit.dev

`bit add src/common-errors/* --main src/common-errors/{PARENT}/{PARENT}.js --tests src/common-errors/{PARENT}/*.test.js --namespace common-errors`
bit add packages/* --tests src/*.test.js --namespace common-errors
--tests src/components/*/*.test.js


bit export exigentcoder.shared-components
npm i @bit/exigentcoder.shared-components.common-errors.is-required-error


https://krimzen-ninja@dev.azure.com/krimzen-ninja/krimzen-ninja-shared-npm/_git/krimzen-ninja-shared-npm
git+https://github.com/KrimZen Ninja/krimzen-ninja-common-errors.git

bit remove exigentcoder.shared-components --remote


## modifying the test environment:

https://discourse.bit.dev/t/can-i-modify-a-build-test-environments/28

> bit tag exigentcoder.common-modules/tester-mocha --patch
> bit export exigentcoder.common-modules tester-mocha
> bit import exigentcoder.common-modules/testers/mocha --tester

# Semver

This project follows [Semver](https://semver.org/) guidelines for version numbering
#
