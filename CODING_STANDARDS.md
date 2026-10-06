# Coding standards

The reference for writing code in this repo, for humans and agents.

## Feature structure

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

## Navigation

- Add new routes to the feature's `navigation/params.ts` and `navigation/routes.ts`, then register the feature navigator in `apps/main-app/ts/navigation/params/AppParamsList.ts` and in the stack navigator that hosts it (usually `apps/main-app/ts/navigation/AuthenticatedStackNavigator.tsx`).
- Navigate with the typed hook `useIONavigation()`; type screen props and route params with `IOStackNavigationRouteProps<ParamsList, Route>`.

## Redux and sagas

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

## UI

- Build UI from **`@io-app/design-system`** components; write a custom component only when the design system has no suitable primitive.
- Take every color from the semantic tokens of `useIOTheme()`.
- Give every interactive element an accessible label.
- Render every user-facing string through an `I18n.t(...)` key, added as described in the I18n section of `AGENTS.md`.
- Name every magic number or hardcoded value as an enum, string literal, or documented constant.

## Testing

- Pair every bug fix with a regression test.
- Co-locate tests in `__tests__/` next to implementation
- Use `renderScreenWithNavigationStoreContext` for screens
- Use `withStore` HOC for components needing store
- Use `expectSaga` for saga integration tests, `testSaga` for unit tests
- Write similar scenarios as `test.each` over an array of cases with descriptive names, interpolated as `$name` in test titles.
- Derive initial state from `appReducer(undefined, applicationChangeState("active"))` for realistic defaults.

## Comments

- Comment business-logic constraints and side effects the code cannot show; when code needs a long explanation, refactor it instead.
