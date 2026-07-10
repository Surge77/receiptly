# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: [SemVer](https://semver.org/).

## [Unreleased]
### Added
- Thermal-receipt UI design system: paper-cream palette, printer-mono type, serrated `ReceiptCard`, `InkButton`, dashed tear-lines (all 7 screens restyled).
- Custom launcher icon + Android adaptive icon (vermillion receipt glyph).
- Local Android release-build path (prebuild + Gradle, ~3 min incremental).
- Gallery import, CSV export, edit-expense, history month/category filters, user-added categories.
- Project governance: README, LICENSE (MIT), SECURITY, CODE_OF_CONDUCT, CONTRIBUTING, MAINTENANCE.
- GitHub issue/PR templates and CI workflow (lint, typecheck, test).

### Fixed
- Release APK crashed instantly at launch: `react-native-gifted-charts` requires a gradient package at JS module load — added `expo-linear-gradient`. Root-caused via emulator logcat.
- `Link asChild` clobbered `InkButton` styles (prop spread order); missing settings screen header title.
- Aligned 8 Expo packages to SDK 56 expected patch versions; removed schema-invalid `app.json` keys (`newArchEnabled`, `edgeToEdgeEnabled`).

### Notes
- Gradle 9 + RN gradle-plugin: re-patch `foojay-resolver-convention` to `1.0.0` in `node_modules` after `npm install` (see README).
