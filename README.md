# Receiptly

> Offline-first **Android** expense tracker that turns a photo of a receipt into a categorized expense using **on-device OCR**. No cloud, no account, no typing.

[![CI](https://github.com/Surge77/receiptly/actions/workflows/ci.yml/badge.svg)](https://github.com/Surge77/receiptly/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why
Manual expense entry is tedious, so people stop. Receiptly removes the typing: snap a receipt → on-device ML Kit OCR reads it → a parser extracts amount, date, and merchant → you confirm and it's logged. Everything stays on your phone.

## Status
🟢 **Feature-complete except hardware-gated steps.** All device-independent work across Phases 0–6 is implemented and verified headlessly: data layer, parser, review-save logic, dashboard + pie chart, history search, image compression, a11y, error boundary. Full gate (`lint + typecheck + test`) is green with **80 tests** in CI, and the Android JS bundle builds clean.

**Parser amount-extraction accuracy: 96.2%** on the labeled OCR fixture set (target ≥85%).

An **EAS development APK has been built successfully** (Android, SDK 56 — full native graph compiled in the cloud), so Phase 0/7 build artifacts exist. Beyond the core phases, the app also has gallery import, CSV export, edit-expense, history month/category filters, and user-addable categories.

**Still needs a physical Android phone:** running that APK for on-device ML Kit OCR accuracy on real receipts (Phase 3) and a Maestro E2E run (Phase 6). See [PLAN.md → CURRENT IMPLEMENTATION](PLAN.md) for the on-device QA checklist.

## Stack
Expo (dev build) · React Native · TypeScript · Expo Router · expo-camera · ML Kit Text Recognition (on-device) · expo-sqlite + Drizzle ORM · Zustand · gifted-charts · Jest + React Native Testing Library · Maestro (E2E) · EAS Build.

> ⚠️ Uses native modules (ML Kit), so it runs on an Expo **development build**, **not** Expo Go.

## Getting started
**Prerequisites:** Node LTS, a physical Android phone (USB debugging) or emulator, a free [Expo/EAS](https://expo.dev) account. **Android Studio is optional** (only for an emulator — a real phone + EAS Build is enough).

```bash
npm install
npm run db:generate                 # regenerate Drizzle migrations if schema changed
npx eas build --profile development --platform android   # one-time: build the dev client
npm start                           # expo start --dev-client; open on your phone
```

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
