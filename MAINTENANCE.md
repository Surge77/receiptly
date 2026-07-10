# Maintenance

How this project is kept healthy. Solo-maintained, best-effort.

## Cadence
- **Dependencies:** review monthly; apply security patches promptly (`npm audit`).
- **Expo SDK:** upgrade one SDK at a time, following the official upgrade guide; verify a dev build boots on a real device before merging.
- **Releases:** SemVer; tag when a milestone completes and CI is green.

## Branching
- `main` is always releasable and protected (CI must pass).
- Work happens on `feature/*` and `fix/*` branches via PR.

## Definition of "green"
A change is mergeable only when:
- `npm run lint` — clean
- `npm run typecheck` — clean
- `npm test` — passing, coverage gates met (≥80% services/lib; 100% parser + rules)
- For UI/native changes: a manual dev-build smoke test on a physical Android device.

## Dependency policy
- Pin direct dependencies; commit the lockfile.
- Before adding a dependency, check: maintenance recency, downloads, license, and APK size impact.
- Prefer Expo-supported libraries to keep the managed build path working.
- Check optional peer deps of UI libraries against `package.json` — they fail only at runtime in release builds (gifted-charts/`expo-linear-gradient` incident). Smoke-test a release APK on the emulator before shipping links.

## Known workarounds
- **foojay-resolver-convention 0.5.0 vs Gradle 9** — after every `npm install`, bump it to `1.0.0` in `node_modules/@react-native/gradle-plugin/settings.gradle.kts` or local Gradle builds fail (`NoSuchFieldError: JvmVendorSpec.IBM_SEMERU`). Remove once RN ships the fix (facebook/react-native#55781).

## Release checklist
1. Full gate passes (lint, typecheck, tests).
2. CHANGELOG updated.
3. Bump version, tag `vX.Y.Z`.
4. EAS release build produced and smoke-tested on a clean device.
5. Record the current parser accuracy number in the README.

## Triage
- Bugs labeled `bug`; security via [SECURITY.md](SECURITY.md) (never public).
- Out-of-scope requests are closed with a short rationale.
