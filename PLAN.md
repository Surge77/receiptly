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
- **Unit tests:** Jest — pure-logic suites run on **ts-jest** (Node); **component tests** use `jest-expo` + React Native Testing Library (RNTL), added in Phase 4
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
- **Phase 0 — Bootstrap:** ✅ done. Expo Router, ESLint flat + Prettier, Jest, EAS profiles, CI on Node 24, **and a successful EAS cloud dev build** (Android APK, SDK 56 — full native graph compiled). ⏳ only running that APK on a physical phone remains.
- **Phase 1 — Data layer:** ✅ Drizzle schema + generated migration, `seedCategories`, driver-injected `ExpenseRepository`. CRUD + `monthlyByCategory` + filters tested **headlessly** against real SQLite (`better-sqlite3`).
- **Phase 2 — Parser:** ✅ pure `ReceiptParser` + `CategoryRules` + labeled OCR fixtures. **Amount accuracy 96.2%** (target ≥85%); 100% line coverage.
- **Phase 4 — Review→Save:** ✅ logic complete: review-screen form logic extracted to a pure `expense-draft` module (prefill, validation, draft-build) and unit-tested headlessly; repository persistence tested. ⏳ RNTL *rendering* tests deferred (see toolchain note) and on-device save unverified.
- **Phase 5 — Dashboard & History:** ✅ month total, **category pie chart** (`react-native-gifted-charts`, pure `toPieSlices` mapper + tests), history filter/search with tested query layer. ⏳ on-device visual check pending.
- **Phase 6 — Polish:** ✅ a11y labels, empty/error states, app-wide error boundary, image compression (≤1600px before OCR/storage). ⏳ Maestro E2E run needs an emulator/device.
- **Phase 7 — Build/CI:** ✅ CI green on every commit; **EAS development APK built successfully** (installable artifact exists). ⏳ release AAB + `v0.1.0` tag are a follow-up once on-device QA passes.
- **Phase 3 — Camera + OCR:** camera + gallery import + ML Kit OCR wired (`app/capture.tsx`, `src/services/ocr-service.ts`). ⏳ true OCR accuracy on photographed receipts needs the APK on a real phone — the one thing no emulator/CI can validate.

**Extra features beyond the original phase list (device-independent, shipped):** gallery import, CSV export, edit-expense, history month/category filters, user-addable categories + Settings.

### On-device QA checklist (run after installing the APK)
1. Install the EAS dev-build APK on an Android phone; run `npx expo start --dev-client` and open the app.
2. Grant camera permission → snap a clearly-printed receipt → confirm Review shows a parsed amount + date within ~2.5 s.
3. Pick an existing receipt photo from gallery → same Review prefill.
4. Edit the amount/category → Save → appears on dashboard; month total + pie chart update.
5. History: filter by month, by category, and text search; Export CSV opens the share sheet.
6. Add a custom category in Settings → it appears in the Review picker.
7. Edit then delete an expense → changes persist after force-closing/reopening (airplane mode on).
8. Record real-receipt amount-extraction accuracy across ≥10 receipts on ≥2 phones — the headline metric the fixtures only approximate.

**Gate status:** `npm run lint && npm run typecheck && npm test` all green (**80 tests**, 100% lines on covered modules) — verified in GitHub Actions CI on Node 24. Android JS bundle (`expo export`) verified clean.
**Test toolchain note:** all current suites are pure logic + SQLite, run under **ts-jest** (Node) — no React Native test stack. `jest-expo` + React Native Testing Library will return for component *rendering* tests; they are intentionally absent because RNTL v14's `test-renderer@1` peer pulls a non-deterministic RN-0.86 tree that breaks strict `npm ci` on this RN-0.85/React-19 project. `.npmrc` sets `legacy-peer-deps=true` (expo-router peer-declares RNTL) to keep the lock file stable.
**Cannot be done without hardware:** on-device OCR accuracy on real photographed receipts (Phase 3), Maestro E2E (Phase 6), installable APK + release tag (Phase 7).

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
