# Receiptly — Production Context Plan

> Built to the **Prompt Context template (production grade)**. This is the single source of truth for scope, architecture, and verification. Hand this file (or any section) to an AI coding agent as context. Repo: https://github.com/Surge77/receiptly

---

## PROJECT
**Goal:** An offline-first **Android** app that turns a photo of a paper receipt into a categorized expense using **on-device OCR** — no manual typing, no cloud, no account. Solves the "I stop tracking expenses because entry is tedious" problem.

## USERS
**Target users:** Individuals in India (students, early-career professionals) who abandon expense tracking because manual entry is slow. They want: fast capture, privacy (data stays on device), works offline, simple monthly view. Single-user, single-device in v1.

## FUNCTIONAL REQUIREMENTS
- Capture a receipt via **camera** or pick from **gallery**.
- Run **on-device OCR** (ML Kit) on the image → raw text.
- **Parse** raw text → `{ amount, date, merchant }` with a confidence signal.
- **Review & edit** screen: pre-fill parsed fields, let user correct, pick a category.
- **CRUD** expenses (create, list, view detail, edit, delete).
- **Auto-categorize** by merchant keyword rules; manual override always wins.
- **Dashboard:** current-month total, spend-by-category chart, recent expenses.
- **History:** filter by month and category; text search by merchant/note.
- Store the receipt image locally and link it to the expense.
- Persist everything **offline** (survives app restart, airplane mode).
- **Export to CSV** (stretch).

## NON-FUNCTIONAL REQUIREMENTS
- **Offline-first:** zero network dependency for core flows.
- **Private by default:** images + data never leave the device.
- **Fast:** OCR + parse round-trip target < 2.5 s on a mid-range phone.
- **Small:** release APK target < 40 MB.
- **Type-safe:** TypeScript `strict`, no `any`.
- **Testable:** business logic decoupled from UI and native modules.
- **Accessible:** labeled controls, sufficient contrast, scalable text.

## TECH STACK
*(Do not introduce technologies outside this list without updating this section.)*
- **Framework:** Expo (development build, **not** Expo Go) + React Native
- **Language:** TypeScript (`strict`)
- **Navigation:** Expo Router (file-based)
- **Camera:** `expo-camera`
- **OCR:** `@react-native-ml-kit/text-recognition` (on-device, offline, free)
- **Local DB:** `expo-sqlite` + **Drizzle ORM** (typed, migrations)
- **State:** Zustand
- **Charts:** `react-native-gifted-charts`
- **Dates:** `day.js`
- **Image/files:** `expo-file-system`
- **Unit/component tests:** Jest + React Native Testing Library (RNTL)
- **E2E:** Maestro (happy-path flows on emulator/device)
- **Build/CI:** EAS Build (cloud) + GitHub Actions (lint, typecheck, test)
- **Lint/format:** ESLint + Prettier

## ARCHITECTURE
Layered, offline-first, **no backend**. Strict separation so logic is testable without a device.

```
UI (screens / components, Expo Router)
        │  (calls, reads store)
State (Zustand stores)
        │
Services
  ├── OcrService        image URI → raw text   (wraps ML Kit)
  ├── ReceiptParser     raw text → ParsedReceipt (PURE — fully unit-tested)
  ├── CategoryRules     merchant → category     (PURE)
  └── ExpenseRepository CRUD + aggregates       (wraps Drizzle/SQLite)
        │
Persistence (expo-sqlite via Drizzle) + Image store (expo-file-system)
```

**Proposed folder structure:**
```
app/                 # Expo Router screens (dashboard, capture, review, history, detail)
src/
  services/          # ocr, parser, category-rules, repository
  db/                # drizzle schema, migrations, client
  state/             # zustand stores
  components/        # reusable UI
  lib/               # date, currency, formatting helpers
  types/             # shared TS types
tests/               # mirrors src/ ; parser fixtures live here
.maestro/            # E2E flows
```
**Key principle:** `ReceiptParser` and `CategoryRules` are **pure functions** — no React, no native, no DB. They carry the core engineering and are 100% unit-testable headlessly.

## DOMAIN ENTITIES
- **Expense** — one recorded spend (amount, currency, merchant, category, date, note, image, raw OCR text).
- **Category** — a spend bucket (name, color). Seeded defaults + user-addable.
- **ParsedReceipt** (transient, not persisted) — OCR parser output + per-field confidence.

## DATABASE SCHEMA
```sql
-- categories
id          INTEGER PRIMARY KEY
name        TEXT NOT NULL UNIQUE
color       TEXT NOT NULL              -- hex
created_at  INTEGER NOT NULL           -- epoch ms

-- expenses
id            INTEGER PRIMARY KEY
amount        INTEGER NOT NULL          -- store paise (minor units) to avoid float drift
currency      TEXT NOT NULL DEFAULT 'INR'
merchant      TEXT
category_id   INTEGER REFERENCES categories(id)
spent_at      INTEGER NOT NULL          -- epoch ms (receipt date)
note          TEXT
image_uri     TEXT
raw_ocr_text  TEXT
created_at    INTEGER NOT NULL

-- indexes
CREATE INDEX idx_expenses_spent_at     ON expenses(spent_at);
CREATE INDEX idx_expenses_category_id  ON expenses(category_id);
```
**Note:** money stored as integer **paise** — never floats.

## API CONTRACTS
No HTTP. Contracts are **internal service interfaces** (TypeScript):
```ts
interface OcrService { recognize(imageUri: string): Promise<string>; }

interface ParsedReceipt {
  amountMinor: number | null;     // paise
  date: string | null;            // ISO yyyy-mm-dd
  merchant: string | null;
  confidence: { amount: number; date: number; merchant: number };
}
interface ReceiptParser { parse(rawText: string): ParsedReceipt; }

interface CategoryRules { categorize(merchant: string | null): string; }

interface ExpenseRepository {
  create(e: NewExpense): Promise<Expense>;
  list(filter?: ExpenseFilter): Promise<Expense[]>;
  getById(id: number): Promise<Expense | null>;
  update(id: number, patch: Partial<NewExpense>): Promise<Expense>;
  remove(id: number): Promise<void>;
  monthlyByCategory(month: string): Promise<CategoryTotal[]>;
}
```

## CONSTRAINTS
- **On-device only** — no server, no external API, no auth in v1.
- **Android-first**; iOS is a later port, not a v1 goal.
- **INR only** in v1.
- Requires an Expo **development build** (ML Kit is native) — Expo Go will not work.
- Solo developer, AI-assisted; keep modules small and independently testable.
- **File size limit 300 lines**; split by responsibility before exceeding.

## CODING RULES
- TypeScript `strict`; never `any` (use `unknown` + narrow).
- **Named exports** only; functional components + hooks.
- File names **kebab-case**; types `PascalCase`; constants `UPPER_SNAKE_CASE`.
- No mutation of inputs; return new values.
- Validate at boundaries (OCR output, user input) before persisting.
- Parameterized queries only (Drizzle) — never string-concatenate SQL.
- No secrets in the repo (none needed — fully on-device).

## CURRENT IMPLEMENTATION
Scaffolded on **Expo SDK 56** (React Native 0.85, React 19, TypeScript strict). Implemented so far:
- **Phase 0 — Bootstrap:** project config (Expo Router, ESLint flat + Prettier, Jest via `jest-expo`, EAS profiles in `eas.json`). Device dev-build verification still pending (needs a physical Android phone).
- **Phase 1 — Data layer:** Drizzle schema (`src/db/schema.ts`) + generated migration, `seedCategories`, and a driver-injected `ExpenseRepository`. CRUD + `monthlyByCategory` + filters are tested **headlessly** against real SQLite (`better-sqlite3`) — 11 passing repo tests.
- **Phase 2 — Parser:** pure `ReceiptParser` + `CategoryRules` with a labeled OCR fixture set. **Amount-extraction accuracy: 91.7%** (target ≥85%); 100% line coverage on both pure modules.
- **Phases 3–5 (wired, device-pending):** camera capture + ML Kit OCR (`src/services/ocr-service.ts`, `app/capture.tsx`), review/edit + category picker (`app/review.tsx`), dashboard + history + detail screens, Zustand store. These typecheck and lint clean but await on-device verification (camera, ML Kit, expo-sqlite are native).

**Gate status:** `npm run lint && npm run typecheck && npm test` all green (59 tests).
**Remaining:** on-device OCR verification (Phase 3), dashboard category chart via gifted-charts (Phase 5), a11y/error-boundary polish + Maestro run (Phase 6), CI/EAS release (Phase 7).

## SECURITY REQUIREMENTS
- No API keys, tokens, or secrets — nothing to leak.
- Receipt images + DB stay in app-private storage; never uploaded.
- Request **only** the camera permission (and media read for gallery); least privilege.
- Sanitize/validate OCR text and user edits before writing to SQLite.
- No PII in logs; never log full file paths or raw receipt contents in release builds.
- Parameterized DB access (Drizzle) — no injection surface.
- `.gitignore` excludes `.env*`, build artifacts, keystores.

## PERFORMANCE REQUIREMENTS
- OCR + parse < 2.5 s per receipt (mid-range device).
- Compress captured image before OCR + storage (cap longest edge ~1600 px).
- Dashboard/history queries use indexes (`spent_at`, `category_id`); no full scans.
- Large lists virtualized (FlashList or FlatList with `getItemLayout`).
- Cold start < 3 s.

## TESTING STRATEGY
Test pyramid — most value at the bottom, which is fully automatable headlessly.
- **Unit (Jest):** `ReceiptParser` against a **labeled fixture set** of real OCR strings → track **amount-extraction accuracy %** (the résumé metric); `CategoryRules`; currency/date helpers; repository CRUD against an in-memory/temp SQLite.
- **Component (Jest + RNTL):** review/edit form, category picker, dashboard rendering — render + fire events, assert behavior (no device).
- **E2E (Maestro):** 2–3 happy-path flows (capture→review→save→appears on dashboard) on an emulator or device.
- **Manual device matrix:** camera + real-receipt OCR on ≥2 physical Android phones — the one thing no emulator/tool can validate.
- **Gates:** ≥80% line coverage on `src/services` and `src/lib`; 100% on parser + category rules.

## ACCEPTANCE CRITERIA
- Snap a receipt → within ~2.5 s the review screen shows a parsed amount and date for clearly-printed receipts.
- Parser hits the agreed **amount-accuracy target** on the labeled fixture set (set baseline in Phase 2, e.g. ≥85%).
- Save → expense appears on dashboard with correct category and updates the month total.
- App fully usable in airplane mode; data persists across restart.
- Delete/edit reflect immediately and survive restart.
- `npm run lint && npm run typecheck && npm test` all green in CI.

## OBSERVABILITY
- Dev-only structured logging behind a `__DEV__` flag.
- App-wide React **error boundary** with a friendly fallback.
- Log parser confidence + accuracy in dev to tune heuristics.
- **Stretch:** Sentry (errors only, no receipt content) for crash reporting.

## DEPLOYMENT
- **EAS Build** → development build (dev/test) and release **AAB/APK**.
- Internal distribution (install on own device / share APK); Play Store is a stretch goal.
- **GitHub Actions:** on every PR run lint + typecheck + unit/component tests; trigger an EAS build on tagged releases.
- Versioning: SemVer; tag `v0.1.0` at first installable build.

## OUT OF SCOPE (v1)
- Cloud sync / multi-device / accounts.
- iOS release polish.
- Bank/UPI/SMS auto-import.
- Multi-currency, budgets, recurring-expense detection, alerts.
- Sharing / collaboration.

## WHEN RESPONDING (rules for any AI agent using this context)
- Follow the architecture above; keep services pure where specified.
- Do **not** introduce new technologies — extend the TECH STACK section first.
- Explain tradeoffs for non-trivial decisions.
- Include tests with every logic change.
- Include migration steps for any schema change.

---

## PHASED ROADMAP (build order + verification gate per phase)
Each phase has an explicit **verification gate** — do not advance until it passes.

| Phase | Build | Verification gate (exit criteria) |
|---|---|---|
| **0 — Bootstrap** | `create-expo-app` (TS), Expo Router, ESLint/Prettier, EAS dev build | App opens on your physical Android phone via dev client; lint+typecheck green |
| **1 — Data layer** | Drizzle schema + migrations, seed categories, `ExpenseRepository` | Jest CRUD + `monthlyByCategory` tests green; migration runs clean |
| **2 — Parser** | `ReceiptParser`, `CategoryRules` (pure) + labeled OCR fixtures | Jest accuracy ≥ baseline (e.g. 85% amount); 100% rule coverage |
| **3 — Camera + OCR** | `expo-camera` capture, image compress, ML Kit wiring | Manual on device: snap → raw OCR text visible/logged |
| **4 — Capture→Review→Save** | Review/edit screen, category picker, persist via repo | RNTL component tests green; manual: saved expense shows in DB |
| **5 — Dashboard & History** | Month total, category chart, history filter/search | Query tests green; manual: totals + chart correct |
| **6 — Polish** | a11y labels, error/empty states, image compression, error boundary | Maestro happy-path E2E passes on emulator/device |
| **7 — Release** | GitHub Actions CI, EAS release build, tag `v0.1.0` | CI green on PR; installable APK runs on a clean device |

**Definition of Done (v1):** all phase gates pass, acceptance criteria met, README quickstart reproduces a working dev build, and the parser accuracy number is recorded in the README (résumé metric).
