# Repository guidelines

Uses TypeScript, React Native + Expo modules, Redux, Redux-Saga, XState v5
Package manager: `pnpm`

## Build, Lint, Test

- `pnpm sync` - full setup (first time / after pull)
- `pnpm setup` - Install deps + hooks
- `pnpm start` - Start Metro bundler
- `pnpm run-ios` - Run on iOS simulator
- `pnpm dev:run-android` - Run on Android emulator
- `pnpm generate` - Generate API models from OpenAPI
- `pnpm test:dev` - Run tests
- `pnpm tsc:noemit` - TypeScript type-check (no emit)
- `pnpm lint` - Lint
- `pnpm lint-autofix` - Lint + autofix
- `pnpm prettify` - Format code

## Feature Structure

Every feature lives under `ts/features/<feature>/` and is self-contained:

- `analytics/` — Mixpanel tracking functions
- `components/` — Feature-specific UI components
- `hooks/` — Feature-specific React hooks
- `navigation/params.ts` — Route param types (`ParamsList`)
- `navigation/routes.ts` — Route name constants
- `saga/` — Redux-Saga workers & watchers
- `screens/` — Screen components (one file per screen)
- `store/actions/` — `typesafe-actions` definitions
- `store/reducers/` — `combineReducers` + slice reducers
- `store/selectors/` — Reselect / plain selectors
- `types/` — Feature-specific TypeScript types
- `utils/` — Feature-specific utilities
- `README.md` — Purpose & guideline for the feature
- `machine/` — XState machine files (only for complex multi-step flows)

## Guidelines

- Never edit anything under `definitions/`. Run `pnpm generate` to update them.
- Before marking any task complete, run `pnpm nx affected --target=lint`, `pnpm prettify`, and `pnpm nx run main-app:tsc-noemit`. Only finish once all three succeed with zero errors.
- Never use `fp-ts` in new code; always use native TypeScript equivalents.
- Always import from `typed-redux-saga/macro`, not bare `redux-saga/effects`.
- The `tsc:noemit` check must pass. Never add `@ts-ignore` without a comment explaining why.
- Never use hardcoded user-facing strings: every string must have an `I18n.t(...)` key.
- Never use magic numbers or hardcoded values. Use enums, string literals, or well documented constants.
- Always use **`@pagopa/io-app-design-system`** components first. Only build custom components when the design system has no suitable primitive.
- Always use `useIOTheme()` to access semantic color tokens. Never use raw hex values.
- All interactive elements must have accessible labels.
- Use Mixpanel for event tracking. Each feature's `analytics/` folder should export typed track functions.
- Investigate problems to the root cause and fix them. Never cover up, ignore, or hide a problem just to make it disappear.

## Navigation

- Always add new routes to both the feature's `navigation/params.ts` and `navigation/routes.ts`, then register the navigator in `ts/navigation/params/AppParamsList.ts` and the root navigator.
- Always access navigation and route params with the typed hook `useIONavigation()`.

## Redux

- Define Redux actions with `createAction` / `createAsyncAction` from `typesafe-actions`.
- Always import saga effects from `typed-redux-saga/macro` for full type inference.
- Use `withRefreshApiCall` for authenticated endpoints that require automatic token refresh.
- Use typed wrappers `useIOSelector`, `useIODispatch`, `useIOStore` — **never** raw `useSelector` / `useDispatch` / `useStore`.
- Do not use inline selectors, always define selector functiosn inside feature's `store/selectors/` folder.

## State machines

- `machine.ts` must be **pure and portable**, it contains no React, Redux, or navigation imports;
- All side-effects (navigation, Redux dispatch, toasts) are injected via the provider.
- Always use nested states for complex flows with sub-steps.
- Define fully-typed context with JSDoc comments and an initial state
- Define events as tagged union types with kebab-case type names
- Use absolute state IDs for cross-hierarchy transitions (e.g. `#myMachine.Failure`)

## Testing

- Add tests for new behavior: cover success, failure, and edge cases.
- Add non regressions tests when fixing bugs.
- Co-locate tests in `__tests__/` next to implementation
- Use `renderScreenWithNavigationStoreContext` for screens
- Use `withStore` HOC for components needing store
- Use `expectSaga` for saga integration tests, `testSaga` for unit tests
- Use `test.each` to avoid repeating similar tests across multiple scenarios
- Define scenario arrays with descriptive names and use `$name` interpolation in test titles
- Derive initial state from `appReducer(undefined, applicationChangeState("active"))` for realistic defaults.

## Documentation

- Always document exported functions, shared utilities, and public APIs to ensure cross-feature clarity.
- Never write redundant "echo" comments that simply repeat the function or variable name.
- Always prioritize explaining business logic constraints and side effects over obvious implementation steps.
- Never leave JSDoc blocks unmaintained; outdated documentation is considered a critical code smell.
- Never add comments to self-explanatory code; if it needs a "novel" to explain, refactor the logic instead.

## Commits

- Use conventional commits specification
- Write commit messages focused on user impact, not implementation details.
- **NEVER** add Co-Authored-By with yourself as co-author of the commit. Agents cannot be authors, humans can be, Agents are assistants.
- **NEVER** push to master, always check to have created a dedicated branch for the issue

## Pull requests

Before pushing:
1. Review the full diff. Keep only intentional, task-related changes. Remove anything unrelated.
2. Ensure the code follows project standards and architectural boundaries.
3. Run pnpm `tsc:noEmit`, `pnpm lint`, and all relevant tests. Fix all issues. Do not proceed if anything fails.
4. Rebase your branch onto master. Resolve all conflicts. If conflicts are complex, stop and ask for guidance.

Then push the branch to the remote and open the PR creation page in the browser with title and body pre-filled.
```
gh pr create --web --title <title> --body <body>
```
- Use title format `type: [ISSUE-ID] short description`, under 70 characters, using conventional commit types.
- Always use `.github/PULL_REQUEST_TEMPLATE.md`. Clearly explain what changed and why. Do not open the PR if incomplete.
- Provide clear steps to verify the changes, expected behavior, and relevant edge cases. Add "Steps to Reproduce" for bugs.
- Always use `--web` to review the PR in the browser, then stop immediately after it opens.
