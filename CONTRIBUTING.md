# Contributing to Receiptly

Thanks for your interest! This is a solo-maintained portfolio project, but issues and PRs are welcome.

## Ground rules
- Read [PLAN.md](PLAN.md) first — it defines the architecture and scope. PRs that add technologies outside the **TECH STACK** section, or features in **OUT OF SCOPE**, will be declined unless the plan is updated first.
- Be respectful — see the [Code of Conduct](CODE_OF_CONDUCT.md).
- Never commit secrets, keystores, or `.env*` files.

## Dev setup
**Prerequisites:** Node LTS, a physical Android phone (USB debugging) or emulator, a free Expo/EAS account. Android Studio optional.
```bash
git clone https://github.com/Surge77/receiptly.git
cd receiptly
npm install
npx expo start          # open in the dev client on your device
```
> ML Kit is a native module → use an Expo **development build**, not Expo Go.

## Workflow
1. Branch from `main`: `feature/<short-desc>` or `fix/<short-desc>`.
2. Write tests first where practical (parser, rules, repository are pure/unit-testable).
3. Keep files under **300 lines**; split by responsibility.
4. Run the gate before pushing:
   ```bash
   npm run lint && npm run typecheck && npm test
   ```
5. Open a PR using the template; link the issue and describe how you verified it.

## Commit messages (Conventional Commits)
```
<type>(<scope>): <short description>
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`.
Example: `feat(parser): extract amount from Indian GST receipts`.

## Coding style
- TypeScript `strict`, no `any`; named exports; functional components + hooks.
- kebab-case filenames; `PascalCase` types; `UPPER_SNAKE_CASE` constants.
- No input mutation; validate at boundaries.

## Tests
- Unit/component: Jest + React Native Testing Library.
- E2E: Maestro flows in `.maestro/` (needs emulator/device).
- New logic needs tests; parser/category-rules must stay at 100% coverage.
- Camera + real-receipt OCR is verified manually on a device — note your device/Android version in the PR.
