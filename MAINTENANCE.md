# Maintenance

How this project is kept healthy. Solo-maintained, best-effort.

## Cadence
- **Dependencies:** review monthly; apply security patches promptly (`npm audit`).
- **Expo SDK:** upgrade one SDK at a time, following the official upgrade guide; verify a dev build boots on a real device before merging.
- **Releases:** SemVer; tag when a phase (see [PLAN.md](PLAN.md)) completes and CI is green.

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

## Release checklist
1. All target phase gates pass (PLAN.md roadmap).
2. CHANGELOG updated.
3. Bump version, tag `vX.Y.Z`.
4. EAS release build produced and smoke-tested on a clean device.
5. Record the current parser accuracy number in the README.

## Triage
- Bugs labeled `bug`; security via [SECURITY.md](SECURITY.md) (never public).
- Out-of-scope requests are closed with a pointer to PLAN.md "OUT OF SCOPE".
