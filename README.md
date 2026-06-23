# Receiptly

> Offline-first **Android** expense tracker that turns a photo of a receipt into a categorized expense using **on-device OCR**. No cloud, no account, no typing.

[![CI](https://github.com/Surge77/receiptly/actions/workflows/ci.yml/badge.svg)](https://github.com/Surge77/receiptly/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why
Manual expense entry is tedious, so people stop. Receiptly removes the typing: snap a receipt → on-device ML Kit OCR reads it → a parser extracts amount, date, and merchant → you confirm and it's logged. Everything stays on your phone.

## Status
🟢 **Core engine working.** Phases 0–2 implemented and verified headlessly; capture/review/dashboard UI is wired and awaits on-device verification. Full gate (`lint + typecheck + test`) is green with 59 tests.

**Parser amount-extraction accuracy: 91.7%** on the labeled OCR fixture set (target ≥85%). See [PLAN.md → CURRENT IMPLEMENTATION](PLAN.md) for the phase-by-phase breakdown.

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
