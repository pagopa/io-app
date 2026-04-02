# AGENTS.md — Agent Guide

**Stack:** TypeScript, React Native (with Expo modules), Redux, Redux-Saga, XState v5
**Package manager:** `yarn` (no `npm`)

---

## Critical Rules

- **Generated files**: Never edit anything under `definitions/`. Run `yarn generate` to update them.
- **Global types**: When adding Redux actions/reducers, always update `ts/store/actions/types.ts` and `ts/store/reducers/types.ts`.
- **NO fp-ts**: Avoid `fp-ts` in new code; use native TypeScript equivalents.
- **Design system first**: Always check `@pagopa/io-app-design-system` before building custom UI.
- **Typed saga effects**: Always import from `typed-redux-saga/macro`, not bare `redux-saga/effects`.
- **Strict TypeScript**: The `tsc:noemit` check must pass. No `@ts-ignore` without a comment explaining why.
- **Localization**: No hardcoded user-facing strings — every string must have an `I18n.t(...)` key.

---

## Quick-Reference Commands

- `yarn sync` — Full setup (first time / after pull)
- `yarn setup` — Install deps + hooks
- `yarn start` — Start Metro bundler
- `yarn run-ios` — Run on iOS simulator
- `yarn run-android` — Run on Android emulator
- `yarn dev:run-android` — Android debug (active arch only)
- `yarn generate` — Generate API models from OpenAPI
- `yarn test:dev` — Run tests (watch, no coverage)
- `yarn test:ci` — Run tests in CI mode
- `yarn test:tz` — Run timezone-sensitive tests
- `yarn tsc:noemit` — TypeScript type-check (no emit)
- `yarn lint` — Lint
- `yarn lint-autofix` — Lint + autofix
- `yarn prettify` — Format code

> **Always run `yarn tsc:noemit` and `yarn lint` before considering any change complete.**

---

## Repository Layout

- `ts/App.tsx` — Root component & Redux store setup
- `ts/store/actions/types.ts` — Union of ALL action types (update when adding new actions)
- `ts/store/reducers/types.ts` — `GlobalState` shape (update when adding new reducers)
- `ts/navigation/` — Root navigator + `AppParamsList` (global route registry)
- `ts/components/` — Shared, domain-agnostic UI components
- `ts/hooks/` — Shared React hooks
- `ts/sagas/` — Root saga watcher
- `ts/utils/` — Pure utility functions
- `ts/api/` — `BackendClient` and API utilities
- `ts/i18n.ts` — i18next init
- `ts/features/` — Feature modules (see below)
- `definitions/` — Auto-generated API types from OpenAPI specs (do NOT edit)
- `locales/en/` — English translations (source of truth)
- `locales/it/` — Italian translations
- `locales/locales.ts` — Type-safe i18n key registry

---

## Feature Module Structure

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
- `machine/` — XState machine files (only for complex multi-step flows, see [State Machines](#state-machines-xstate-v5))

---

## TypeScript Rules

- **Strict mode is enforced**: `noImplicitAny`, `noImplicitReturns`, `noUnusedParameters`, `noUnusedLocals`, `strictFunctionTypes`, `useUnknownInCatchVariables` — all `true`.
- **No `allowJs`**: All source files must be `.ts` or `.tsx`.
- Never use `any` except inside XState machine boilerplate or when explicitly required by a library type.
- Prefer `unknown` in `catch` blocks; narrow with type guards before use.
- Use `io-ts` codecs for runtime validation of external data (API responses, deep-link params, stored data).
- Named exports are preferred over default exports for all non-screen/non-navigator files.

---

## Documentation

- [Design System](docs/agents/design-system.md) - UI and Design System
- [Navigation](docs/agents/navigation.md) - Adding new screen and handle navigation
- [Redux](docs/agents/redux.md) - Handle application state via Redux
- [State Machines](docs/agents/state-machines.md) - XState V5 machines for complex logic
- [Testing](docs/agents/testing.md) - Tests structure and utilities
- [Analytics](docs/agents/analytics.md) - Event tracking