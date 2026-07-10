# Receiptly

> Offline-first **Android** expense tracker that turns a photo of a receipt into a categorized expense using **on-device OCR**. No cloud, no account, no typing.

[![CI](https://github.com/Surge77/receiptly/actions/workflows/ci.yml/badge.svg)](https://github.com/Surge77/receiptly/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why
Manual expense entry is tedious, so people stop. Receiptly removes the typing: snap a receipt → on-device ML Kit OCR reads it → a parser extracts amount, date, and merchant → you confirm and it's logged. Everything stays on your phone.

## Status
🟢 **Working standalone release APK, verified on emulator.** All phases implemented: data layer, parser, review-save logic, dashboard + pie chart, history search + filters, gallery import, CSV export, edit-expense, user-added categories, image compression, a11y, error boundary. Full gate (`lint + typecheck + test`) is green with **103 tests**.

**Parser amount-extraction accuracy: 96.2%** on the labeled OCR fixture set (target ≥85%).

The release APK installs and runs standalone (no Metro, no laptop) — launch-crash root cause (missing `expo-linear-gradient` peer dep of gifted-charts) was found via emulator logcat and fixed. The app ships a custom launcher icon and a **thermal-receipt UI**: paper-cream palette, printer-mono type, serrated receipt cards, dashed tear-lines, vermillion stamp accent.

**Still needs a physical Android phone:** ML Kit OCR accuracy on real paper receipts and a Maestro E2E run. See [PLAN.md → CURRENT IMPLEMENTATION](PLAN.md) for the on-device QA checklist.

## Stack
Expo (dev build) · React Native · TypeScript · Expo Router · expo-camera · ML Kit Text Recognition (on-device) · expo-sqlite + Drizzle ORM · Zustand · gifted-charts (+ expo-linear-gradient) · Jest + React Native Testing Library · Maestro (E2E) · EAS Build or local Gradle.

> ⚠️ Uses native modules (ML Kit), so it runs on an Expo **development build**, **not** Expo Go.

## Getting started
**Prerequisites:** Node LTS, a physical Android phone (USB debugging) or emulator, a free [Expo/EAS](https://expo.dev) account (cloud builds only).

```bash
npm install
npm run db:generate                 # regenerate Drizzle migrations if schema changed
npx eas build --profile development --platform android   # one-time: build the dev client
npm start                           # expo start --dev-client; open on your phone
```

### Building an installable APK
Three ways, pick by need:

| Method | Command | Time | Use when |
|--------|---------|------|----------|
| **Local release** (fastest) | `npx expo prebuild --platform android --no-install` then `cd android && gradlew assembleRelease` | ~3 min (after first build) | Android SDK + JDK 17+ installed |
| EAS preview (cloud) | `npx eas build --profile preview --platform android` | 15–30 min queue+build | no local SDK |
| EAS production | `npx eas build --profile production --platform android` | same | Play Store AAB |

Local output: `android/app/build/outputs/apk/release/app-release.apk`.

> **Gradle 9 gotcha:** after every `npm install`, re-patch `node_modules/@react-native/gradle-plugin/settings.gradle.kts` — bump `foojay-resolver-convention` from `0.5.0` to `1.0.0`, else the build fails with `NoSuchFieldError: JvmVendorSpec.IBM_SEMERU` ([facebook/react-native#55781](https://github.com/facebook/react-native/issues/55781)).

> **APK profiles:** `development` = tethered dev client (blank screen standalone — needs Metro). `preview`/local release = JS baked in, runs standalone.

## Scripts (target, available after Phase 0)
```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Jest + RNTL
npm run e2e         # Maestro flows (needs emulator/device)
```

## Architecture
Layered, offline-first, no backend: `UI → Zustand → services (OCR · parser · category-rules · repository) → SQLite`. The parser and category rules are **pure functions** (fully unit-tested). See [PLAN.md](PLAN.md) for the full design, schema, and phased roadmap.

## Testing
Pyramid: unit (parser accuracy on labeled fixtures — the headline metric), component (RNTL), E2E (Maestro), plus a manual device check for real camera/OCR (the one thing no emulator can verify). Details in [PLAN.md → TESTING STRATEGY](PLAN.md).

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues: [SECURITY.md](SECURITY.md).

## License
[MIT](LICENSE) © 2026 Tejas Deshmane
