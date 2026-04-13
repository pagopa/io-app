# Repository guidelines

Uses TypeScript, React Native + Expo modules, Redux, Redux-Saga, XState v5
Package manager: `yarn`

## Build, Lint, Test

- `yarn sync` - full setup (first time / after pull)
- `yarn setup` - Install deps + hooks
- `yarn start` - Start Metro bundler
- `yarn run-ios` - Run on iOS simulator
- `yarn dev:run-android` - Run on Android emulator
- `yarn generate` - Generate API models from OpenAPI
- `yarn test:dev` - Run tests
- `yarn tsc:noemit` - TypeScript type-check (no emit)
- `yarn lint` - Lint
- `yarn lint-autofix` - Lint + autofix
- `yarn prettify` - Format code

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

- Never edit anything under `definitions/`. Run `yarn generate` to update them.
- Avoid `fp-ts` in new code; use native TypeScript equivalents.
- Always import from `typed-redux-saga/macro`, not bare `redux-saga/effects`.
- The `tsc:noemit` check must pass. No `@ts-ignore` without a comment explaining why.
- No hardcoded user-facing strings:  every string must have an `I18n.t(...)` key.
- No magic numbers or hardcoded values.
- All UI components must come from **`@pagopa/io-app-design-system`** first. Only build custom components when the design system has no suitable primitive.
- Use `useIOTheme()` to access semantic color tokens. Never use raw hex values.
- All interactive elements must have accessible labels.
- Use Mixpanel for event tracking. Each feature's `analytics/` folder should esport typed track functions.

## Navigation

- Add new routes to both the feature's `navigation/params.ts` and `navigation/routes.ts`, then register the navigator in `ts/navigation/params/AppParamsList.ts` and the root navigator.
- Access navigation and route params with the typed hook `useIONavigation()`.

## Redux

- Define Redux actions with `createAction` / `createAsyncAction` from `typesafe-actions`.
- Always import saga effects from `typed-redux-saga/macro` for full type inference.
- Use `withRefreshApiCall` for authenticated endpoints that require automatic token refresh.
- Use typed wrappers `useIOSelector`, `useIODispatch`, `useIOStore` — **never** raw `useSelector` / `useDispatch` / `useStore`.
- Do not use inline selectors, always define selector functiosn inside feature's `store/selectors/` folder.

## State machines

- `machine.ts` must be **pure and portable**, it contains no React, Redux, or navigation imports;
- All side-effects (navigation, Redux dispatch, toasts) are injected via the provider.
- Prefer nested states for complex flows with sub-steps
- Define fully-typed context with JSDoc comments and an initial state
- Define events as tagged union types with kebab-case type names
- Use absolute state IDs for cross-hierarchy transitions (e.g. `#myMachine.Failure`)

## Testing

- Add tests for new behavior — cover success, failure, and edge cases.
- Add non regressions tests when fixing bugs.
- Co-locate tests in `__tests__/` next to implementation
- Use `renderScreenWithNavigationStoreContext` for screens
- Use `withStore` HOC for components needing store
- Use `expectSaga` for saga integration tests, `testSaga` for unit tests
- Use `test.each` to avoid repeating similar tests across multiple scenarios
- Define scenario arrays with descriptive names and use `$name` interpolation in test titles
- Derive initial state from `appReducer(undefined, applicationChangeState("active"))` for realistic defaults.

## Commits

- Use conventional commits specification
- Write commit messages focused on user impact, not implementation details.
- **NEVER** add Co-Authored-By with yourself as co-author of the commit. Agents cannot be authors, humans can be, Agents are assistants.
- **NEVER** push to master, always check to have created a dedicated branch for the issue

## Pull requests

Before pushing,perform a self-review of your changes:
1. Review the full diff and verify every change is intentional and related to the task — remove any unrelated changes.
2. Confirm the code follows the project's coding standards and boundaries described in this file.
3. Run `yarn tsc:noEmit` and `yarn lint` and fix any failures.
4. Run relevant individual tests and confirm they pass.
Before pushing, always rebase your branch onto the master branch to avoid merge conflicts and ensure CI runs against up-to-date code.
If there are conflicts, resolve them and continue the rebase. If the rebase is too complex, ask the user for guidance.

Then push the branch to the remote and open the PR creation page in the browser with title and body pre-filled:
- title: conventional commit, under 70 chars, include issue number in between square brackets (e.g. `feat: [ABC-000] title`)
- body: use the template at `.github/PULL_REQUEST_TEMPLATE.md`. Be short and concise, explain what changed and why. Add steps to test the PR, avoid abvious explanations. If the PR fixes a bug, add steps to reproduce it.
    ```
    gh pr create --web --title <title> --body <body>
    ```
The --web flag opens the browser so the user can review and submit.