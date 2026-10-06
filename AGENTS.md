# Repository guidelines

Uses TypeScript, React Native + Expo modules, Redux, Redux-Saga, XState v5
Package manager: `pnpm`

## Build, Lint, Test

- `pnpm nx run main-app:sync` - full setup (first time / after pull)
- `pnpm nx run main-app:start` - Start Metro bundler
- `pnpm nx run main-app:run-ios` - Run on iOS simulator
- `pnpm nx run main-app:dev-run-android` - Run on Android emulator
- `pnpm nx run main-app:generate` - Generate API models from OpenAPI
- `pnpm nx run main-app:test-dev` - Run tests
- `pnpm nx tsc-noemit main-app` - TypeScript type-check (no emit)
- `pnpm nx lint main-app` - Lint
- `pnpm nx run main-app:lint-autofix` - Lint + autofix
- `pnpm format` - Format code

## Feature Structure

Every feature lives under `apps/main-app/ts/features/<feature>/` and is self-contained:

- `analytics/` — typed Mixpanel track functions
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

- `libs/api-types/generated/definitions/` is generated: regenerate it with `pnpm nx run main-app:generate` and never edit it by hand.
- A task is complete only when `pnpm nx affected --targets=lint,oxlint,tsc-noemit` and `pnpm format` both finish with zero errors.
- Write new code with native TypeScript equivalents instead of `fp-ts`.
- Suppress a type error only with `// @ts-expect-error <reason>`; oxlint rejects `@ts-ignore` and directives without a reason.
- Render every user-facing string through an `I18n.t(...)` key.
- Name every magic number or hardcoded value as an enum, string literal, or documented constant.
- Build UI from **`@io-app/design-system`** components; write a custom component only when the design system has no suitable primitive.
- Take every color from the semantic tokens of `useIOTheme()`.
- Give every interactive element an accessible label.

## Navigation

- Add new routes to the feature's `navigation/params.ts` and `navigation/routes.ts`, then register the feature navigator in `apps/main-app/ts/navigation/params/AppParamsList.ts` and in the stack navigator that hosts it (usually `apps/main-app/ts/navigation/AuthenticatedStackNavigator.tsx`).
- Navigate with the typed hook `useIONavigation()`; type screen props and route params with `IOStackNavigationRouteProps<ParamsList, Route>`.

## Redux

- Define Redux actions with `createAction` / `createAsyncAction` from `typesafe-actions`.
- Import saga effects from `typed-redux-saga/macro` (not `redux-saga/effects`) for full type inference.
- Use `withRefreshApiCall` for authenticated endpoints that require automatic token refresh.
- Use the typed wrappers `useIOSelector`, `useIODispatch`, `useIOStore` from `apps/main-app/ts/store/hooks.ts` in place of the `react-redux` hooks.
- Define every selector as a named function in the feature's `store/selectors/` folder.

## State machines

- Keep `machine.ts` pure and portable: inject every side effect (navigation, Redux dispatch, toasts) through `machine.provide(...)` in the feature's `machine/provider.tsx`.
- Use nested states for complex flows with sub-steps.
- Define fully-typed context with JSDoc comments and an initial state
- Define events as tagged union types with kebab-case type names
- Use absolute state IDs for cross-hierarchy transitions (e.g. `#myMachine.Failure`)

## Testing

- Pair every bug fix with a regression test.
- Co-locate tests in `__tests__/` next to implementation
- Use `renderScreenWithNavigationStoreContext` for screens
- Use `withStore` HOC for components needing store
- Use `expectSaga` for saga integration tests, `testSaga` for unit tests
- Write similar scenarios as `test.each` over an array of cases with descriptive names, interpolated as `$name` in test titles.
- Derive initial state from `appReducer(undefined, applicationChangeState("active"))` for realistic defaults.

## Documentation

- Comment business-logic constraints and side effects the code cannot show; when code needs a long explanation, refactor it instead.

## I18n

Lokalise owns every locale value under `apps/main-app/locales/`; CI rejects value changes outside Lokalise `lok_*` PRs.

- Add new keys only to the base locale `apps/main-app/locales/it/index.json`. Lokalise fills in the other languages.
- Leave existing values untouched. When a copy change is requested, report each full dotted key path (e.g. `features.wallet.title`) with its locale and tell the user to edit it on Lokalise.

## Commits

- Use conventional commits specification
- Focus commit messages on user impact rather than implementation details.
- **NEVER** add Co-Authored-By with yourself as co-author of the commit. Agents cannot be authors, humans can be, Agents are assistants.
- Work on a dedicated branch for the issue; **NEVER** push to master.

## Pull requests

Before pushing:

1. Review the full diff and keep only intentional, task-related changes.
2. Run the Guidelines completion checks and all relevant tests; continue only when everything passes.
3. Rebase your branch onto master. Resolve all conflicts. If conflicts are complex, stop and ask for guidance.

Then push the branch to the remote, open the PR creation page in the browser with title and body pre-filled, and stop immediately after it opens:

```
gh pr create --web --title <title> --body <body>
```

- Use title format `type: [ISSUE-ID] short description`, under 70 characters, using conventional commit types.
- Fill every section of `.github/PULL_REQUEST_TEMPLATE.md`.
- In "How to test", give steps to verify the changes, expected behavior, and relevant edge cases. Add "Steps to Reproduce" for bugs.
