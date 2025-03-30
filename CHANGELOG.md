# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [1.2.0] - 2025-03-31
### Fixed
- Fix the typing of `postBuild` in `BuildTimeConfig` when `postBuild` is present in the `BuilderConfiguration`.

### Added
- Add the [`builder.reset()` method](https://github.com/Stivooo/mimicry-js?tab=readme-ov-file#resetting-the-state-of-sequence-and-unique) to reset the state of `sequence`, `unique`, and custom generators [using `resetable`](https://github.com/Stivooo/mimicry-js?tab=readme-ov-file#implementation-of-state-reset);
- Add `FieldType` export.


## [1.1.1] - 2025-03-28
### Fixed
- Fix the behavior of builders using [generator functions](https://github.com/Stivooo/mimicry-js/tree/main?tab=readme-ov-file#using-generatorfunction-to-create-fields): the generator should be initialized on each call of the `one` and `many` methods.

## [1.1.0] - 2025-03-26
### Fixed
- Add default type value for TraitName in `TraitsConfiguration`

### Added
- Add `generate` decorator for fields generation [using `GeneratorFunction`](https://github.com/Stivooo/mimicry-js/tree/main?tab=readme-ov-file#using-generatorfunction-to-create-fields)

## [1.0.2] - 2025-03-22
### Fixed
- Fix the `release.yml` CI for correct archive building and README update.

## [1.0.1] - 2025-03-22
### Fixed
- Just fix the CI workflow to update the README before publishing.

## [1.0.0] - 2025-03-21
### Initial release
- First stable version of the library. Check out the [README](https://github.com/Stivooo/mimicry-js?tab=readme-ov-file#mimicry-js).
