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

> `bit tag exigentcoder.common-modules/tester-mocha --patch`
> `bit export exigentcoder.common-modules tester-mocha`
> `bit import exigentcoder.common-modules/tester-mocha --tester`

# Semver

This project follows [Semver](https://semver.org/) guidelines for version numbering

# Nothing to export

Sometimes you get an error saying there is nothing to export and when you run `npm run bit-add` you get an error like `error: the components packages/entity-metadata does not contain a main file.` to fix this you need to run a manual add individually one at a time in some sort of order before running the export. Run `bit status` to see which module has untracked files.
Example output:

```
λ bit status
modified components
(use "bit tag --all [version]" to lock a version with all your changes)
(use "bit diff" to compare changes)

     > common-errors ... ok
     > entity-metadata ...  issues found
       untracked file dependencies (use "bit add <file>" to track untracked files as components):
          packages/entity-metadata/types.d.ts -> packages/entity-metadata/entity-metadata.d.ts

     > json-schema ... ok
     > mongodb-populate-from-disk ... ok
     > mongodb ... ok
     > validation ... ok
     > version-info ... ok


components pending to be tagged automatically (when their dependencies are tagged)
     > exigentcoder.common-modules/azure-functions ... ok
see troubleshooting at https://docs.bit.dev/docs/troubleshooting-isolating.html
```

In this instance I had to run: 
> `bit add packages/entity-metadata --tests packages/{PARENT}/**/*.test.js -m packages/entity-metadata/index.js --id entity-metadata`

the -m flag may not be needed.

After fixing it I ran:

> `npm run patch` to republish
