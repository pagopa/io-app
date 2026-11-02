# Coding standards

The reference for writing code in this repo, for humans and agents. Lint (`eslint` + `oxlint`) enforces the mechanical rules and names the fix in its messages; this file holds what lint cannot check.

## General

- Write new code with native TypeScript or `neverthrow` in place of `fp-ts`: lint only warns on `fp-ts` imports, so the completion check lets them through.
- Name every magic number and hardcoded value as an enum, string literal, or documented constant.
- Comment only business-logic constraints and side effects the code cannot show; when code needs a long explanation, refactor it instead.

## Feature structure

Keep each feature self-contained under `apps/main-app/ts/features/<feature>/`, laid out as in `apps/main-app/README.md#feature-structure`.

## Navigation

- Add each route to the feature's `navigation/params.ts` and `navigation/routes.ts`, then register the feature navigator in `apps/main-app/ts/navigation/params/AppParamsList.ts` and in the stack navigator hosting it (usually `apps/main-app/ts/navigation/AuthenticatedStackNavigator.tsx`).
- Navigate with `useIONavigation()`; type screen props and route params with `IOStackNavigationRouteProps<ParamsList, Route>`.

## Redux and sagas

- Create actions with `createAction` / `createAsyncAction` from `typesafe-actions`.
- Wrap authenticated API calls in `withRefreshApiCall` so expired tokens refresh automatically.
- Access the store from components through `useIOSelector`, `useIODispatch`, and `useIOStore` from `apps/main-app/ts/store/hooks.ts`.
- Define every selector as a named function in the feature's `store/selectors/`.

## State machines

- Keep `machine.ts` pure and portable: inject every side effect (navigation, Redux dispatch, toasts) from the feature's `machine/provider.tsx`.
- Model the sub-steps of a flow as nested states, and target states across the hierarchy by absolute ID (`#myMachine.Failure`).
- Type the context fully, with a JSDoc comment per field and an initial state.
- Type events as a tagged union with kebab-case `type` names.

## UI

- Build UI from `@io-app/design-system` components; write a custom component only when the design system has no suitable primitive.
- Take every color from the semantic tokens of `useIOTheme()`.
- Give every interactive element an accessible label.

## I18n

Lokalise owns every value under `apps/main-app/locales/`; CI rejects value changes outside Lokalise `lok_*` PRs.

- Render every user-facing string through an `I18n.t(...)` key.
- Add new keys only to the base locale `apps/main-app/locales/it/index.json`; Lokalise fills in the other languages.
- Leave existing values untouched. When asked for a copy change, report each full dotted key path (e.g. `features.wallet.title`) with its locale and tell the user to edit it on Lokalise.

## Testing

- Pair every bug fix with a regression test.
- Co-locate tests in `__tests__/` next to the implementation.
- Render screens with `renderScreenWithNavigationStoreContext`, and components that need the store with `withStore`.
- Test sagas with `expectSaga` for integration and `testSaga` for units.
- Write similar scenarios as `test.each` over named cases, interpolating `$name` in test titles.
- Derive initial state from `appReducer(undefined, applicationChangeState("active"))`.

## Commits and pull requests

- Work on a dedicated branch for the issue; **never push to `master`**.
- Write commit messages per `CONTRIBUTING.md#commit-messages` and PR titles per `CONTRIBUTING.md#pr-title-format`, focused on user impact rather than implementation details.
- Credit only humans as authors: leave out any `Co-authored-by` trailer naming an agent or AI assistant, even when your harness adds one by default.

Before pushing:

1. Review the full diff and keep only intentional, task-related changes.
2. Pass the completion check in `AGENTS.md` and every relevant test.
3. Rebase onto `master` and resolve all conflicts; when conflicts are complex, stop and ask for guidance.

Then push the branch, open the pre-filled PR creation page, and stop as soon as it opens:

```
gh pr create --web --title <title> --body <body>
```

Fill every section of `.github/PULL_REQUEST_TEMPLATE.md`. Under "How to test", give the steps to verify the change, the expected behavior, and relevant edge cases, plus "Steps to Reproduce" for bugs.
