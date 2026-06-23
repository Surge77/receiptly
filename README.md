# Receiptly

> Offline-first **Android** expense tracker that turns a photo of a receipt into a categorized expense using **on-device OCR**. No cloud, no account, no typing.

[![CI](https://github.com/Surge77/receiptly/actions/workflows/ci.yml/badge.svg)](https://github.com/Surge77/receiptly/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why
Manual expense entry is tedious, so people stop. Receiptly removes the typing: snap a receipt → on-device ML Kit OCR reads it → a parser extracts amount, date, and merchant → you confirm and it's logged. Everything stays on your phone.

## Status
🚧 **Greenfield.** This repo currently holds the [production plan](PLAN.md) and project governance. App scaffolding starts at **Phase 0** in the plan.

## Stack
Expo (dev build) · React Native · TypeScript · Expo Router · expo-camera · ML Kit Text Recognition (on-device) · expo-sqlite + Drizzle ORM · Zustand · gifted-charts · Jest + React Native Testing Library · Maestro (E2E) · EAS Build.

> ⚠️ Uses native modules (ML Kit), so it runs on an Expo **development build**, **not** Expo Go.

## Getting started
**Prerequisites:** Node LTS, a physical Android phone (USB debugging) or emulator, a free [Expo/EAS](https://expo.dev) account. **Android Studio is optional** (only for an emulator — a real phone + EAS Build is enough).

```bash
# Phase 0 (bootstrap) — see PLAN.md
npx create-expo-app@latest .        # TypeScript template, in this folder
npm install
npx expo start                      # scan QR with the dev client on your phone
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
