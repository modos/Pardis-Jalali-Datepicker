# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [1.0.1] - 2026-02-22

### Fixed
- Prevented navigating to invalid years by clamping year/month navigation.
- Updated decade navigation to use engine methods so clamping is applied consistently.

### Changed
- Set the minimum navigable year to 1.

### Added
- Added a boundary test script to verify year navigation never goes below the minimum year.

## [1.0.0] - 2026-02-21

### Added
- Initial release.
