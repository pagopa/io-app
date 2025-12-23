# IO App - Copilot Instructions

## Project Overview
IO is the Italian government's official mobile app for public services, built with **React Native 0.78** and **TypeScript**. It uses **Redux** for state management and **Redux-Saga** for side effects.

## Architecture

### Feature-Based Structure
Code is organized in `ts/features/` with each feature being a self-contained module:
```
ts/features/<feature>/
├── components/     # UI components
├── screens/        # Screen components
├── store/          # actions/, reducers/, selectors/
├── sagas/          # Async logic with redux-saga
├── navigation/     # Routes and params
├── analytics/      # Mixpanel tracking
└── __tests__/      # Co-located tests
```
Key features: `authentication/`, `itwallet/` (IT Wallet), `payments/`, `messages/`, `services/`, `idpay/`, `pn/` (Piattaforma Notifiche).

**Complex features** may have sub-features following the same structure. For example, `itwallet/` has sub-features like `issuance/`, `presentation/`, `identification/`, each with their own `components/`, `screens/`, `store/`, etc.

### State Management Pattern
- **Actions**: Use `typesafe-actions` with `createStandardAction` or `createAsyncAction`
- **Reducers**: Combine in feature's `store/reducers/index.ts`, register in `ts/features/common/store/reducers/`
- **Selectors**: Use `reselect` for memoization
- **Sagas**: Use `typed-redux-saga/macro` for type-safe generator functions

Examples:
- **Root saga composition**: `ts/sagas/index.ts` uses `yield* all([call(featureSaga)])` to wire all domain sagas.
- **Feature saga with testable helpers**: `ts/features/identification/sagas/index.ts` exposes small generators (e.g. `waitIdentificationResult`, `startAndReturnIdentificationResult`) that are tested with `redux-saga-test-plan` in `ts/features/identification/sagas/__tests__/identificationSaga.test.ts`.
- **Feature reducer aggregation**: `ts/features/itwallet/common/store/reducers/index.ts` composes sub‑reducers with `combineReducers` and wraps them with `redux-persist` (migrations included).
- **Global reducer aggregation**: `ts/store/reducers/index.ts` combines feature reducers, applies custom `PersistConfig`s, and handles global auth/logout logic in the root reducer.

### XState for Complex Flows
IT Wallet (`itwallet/`) uses XState v5 for credential issuance flows:
- Machines in `machine/<name>/machine.ts`
- Actions/actors/guards separated into dedicated files
- Provider pattern with `@xstate/react` context

## Design System
Import all UI components from `@pagopa/io-app-design-system`:
```tsx
import { VSpacer, H3, Body, IOColors, useIOToast } from "@pagopa/io-app-design-system";
```
Never create custom typography or spacing—use the design system constants.

## Internationalization
Translations are in `locales/{it,en,de}/` as YAML files. **Only Italian (`it`) is mandatory**; English (`en`) and German (`de`) are optional. After modifying:
```bash
yarn generate:locales
```
Access translations via the `I18n.t()` global:
```tsx
import I18n from "../../i18n";
I18n.t("features.itWallet.discovery.title")
```

## API Integration
- API clients are auto-generated from OpenAPI specs in `definitions/`
- Run `yarn generate` to regenerate after spec changes
- Generated types live alongside specs; clients in `ts/api/`

## Analytics & Tracking
- **Mixpanel client**: Centralized in `ts/mixpanel.ts` (init, identify, super/profile properties, queueing before init).
- **Feature-level helpers**: Each domain exposes tracking functions under `analytics/` (e.g. authentication `common/analytics/spidAnalytics.ts`, services `common/analytics/index.ts`, fast login `analytics/optinAnalytics.ts`) that wrap `mixpanelTrack` with `buildEventProperties`.
- **Usage rule**: From screens/sagas, call domain helpers (e.g. `trackLoginSpidError`, `trackServicesHome`) instead of calling `mixpanelTrack` directly.
- **Profiles & super properties**: Update via helpers that accept `GlobalState` (e.g. `updateLoginMethodProfileProperty`, `updateLoginSessionProfileAndSuperProperties`) rather than manipulating Mixpanel profiles inline.
- **Opt-in**: Respect tracking preferences — do not enqueue events if the user has opted out; use `enqueueMixpanelEvent` only for early events before Mixpanel initialization as documented in `ts/mixpanel.ts`.

## Error Handling & Observability
- **Sentry setup**: Configured in `ts/App.tsx` and wraps the root component with `Sentry.wrap(App)`. Uses `beforeSend` to strip user data, drop noisy HTTP client errors, and apply sampling; errors tagged with `isRequired` always get sent.
- **When to capture**: Use `Sentry.captureException`/`captureMessage` only for unexpected failures (e.g. secure-storage errors in `store/storages/keychain.ts` and `features/itwallet/common/store/storages/itwSecureStorage.ts`, push notification errors) — do not spam Sentry for expected flows.
- **Error boundaries**: For complex UI like markdown rendering, wrap components in `Sentry.ErrorBoundary` with a user-friendly fallback (see `components/IOMarkdown/index.tsx`).
- **Error helpers**: Reuse utilities from `ts/utils/errors.ts` (`getError`, `getNetworkError`, `getNetworkErrorMessage`, `convertUnknownToError`) to normalize unknown errors and network failures before logging or displaying messages.

## Key Commands
```bash
yarn setup              # Install deps + generate APIs + locales
yarn sync               # Full sync including iOS pods
yarn generate           # Regenerate API models + locales
yarn test:dev           # Run tests without coverage
yarn lint               # ESLint check
yarn lint-autofix       # ESLint with auto-fix
yarn tsc:noemit         # TypeScript check
yarn dev:run-android    # Run Android in production debug mode
yarn run-ios            # Run iOS
```

### Android Emulator Setup
Before running on Android emulator, disable hardware keystore check:
```bash
yarn lollipop_checks:comment   # Before running emulator
yarn lollipop_checks:uncomment # Before committing (required!)
```

## Code Style
- **Language**: Strict TypeScript; no `any` unless unavoidable. Prefer type aliases and discriminated unions for complex states. Use `const` by default and avoid `let` unless mutation is strictly required.
- **Types**: Avoid `enum` unless strictly required (e.g. interop with external APIs). Prefer string literal unions in lowercase `snake_case`, e.g. `type MyType = "type_a" | "type_b"`.
- **Naming**: Use `camelCase` for files and variables, `CamelCase` (capitalized) for components and classes, and `UPPER_SNAKE_CASE` for constants.
- **Components**: Use function components with typed props:
   ```tsx
   type Props = { /* ... */ };
   export const MyComponent = ({ ... }: Props) => { /* ... */ };
   ```
- **Imports**: Group external then internal imports. Use relative paths without file extensions (e.g. `"../../store/hooks"`).
- **Redux**: Co-locate actions/reducers/selectors under `store/`. Use `typesafe-actions` for actions and `combineReducers` for feature reducers.
- **Hooks**: Use IO-specific hooks (`useIOSelector`, `useIOStore`, `useIONavigation`, `useIOToast`) instead of raw `useSelector`/`useDispatch`/`useNavigation`.
- **Styling/UI**: Prefer `@pagopa/io-app-design-system` components and spacing/typography tokens over custom styles; avoid reinventing standard UI patterns.
- **Side effects**: Put async logic and business side effects in sagas or XState machines, not directly in components.

## Functional Programming
The codebase historically uses `fp-ts`, but it is being **deprecated in favor of vanilla TypeScript**. Use `fp-ts` only when there is a clear and significant advantage. For new code, prefer:
- Standard `null`/`undefined` checks over `Option<T>`
- Try/catch or Result types over `Either<E, A>`
- Native array methods over `pipe()` chains

### Legacy `fp-ts` Patterns (Avoid in New Code)
When working with existing code, you may encounter these patterns:
- **`Option<T>`**: Represents optional values
  - `O.some(value)` - wraps a value
  - `O.none` - represents absence
  - `O.map()`, `O.fold()`, `O.getOrElse()`, `O.toUndefined()` - transformations
  - Import: `import * as O from "fp-ts/lib/Option";`
- **`Either<E, A>`**: Represents success/failure with error type
  - `E.right(value)` - success value
  - `E.left(error)` - error value
  - `E.map()`, `E.fold()` - transformations
  - Import: `import * as E from "fp-ts/lib/Either";`
- **`pipe()`**: Function composition for chaining transformations
  - Import: `import { pipe } from "fp-ts/lib/function";`
  - Example: `pipe(value, O.fromNullable, O.map(fn), O.getOrElse(() => default))`
- **Array utilities**: `RA.ReadonlyArray`, `AR.Array` modules for functional array operations

### `pot` for Async State (Still in Use)
The codebase uses `pot` from `@pagopa/ts-commons/lib/pot` to represent async data states. This is **still actively used** and should be used for new async state:
- **States**: `none`, `noneLoading`, `noneUpdating`, `noneError`, `some`, `someLoading`, `someUpdating`, `someError`
- **Constructors**: `pot.none`, `pot.some(value)`, `pot.toLoading(pot)`, `pot.toError(pot, error)`
- **Type guards**: `pot.isNone()`, `pot.isSome()`, `pot.isLoading()`, `pot.isError()`
- **Utilities in `utils/pot.ts`**: `isStrictNone()`, `isStrictSome()`, `foldK()`, `potFoldWithDefault()`, `isLoadingOrUpdating()`
- **Usage**: Define reducer state as `pot.Pot<DataType, ErrorType>`, handle all states in UI with `pot.fold()` or custom utilities

### `io-ts` for Runtime Validation (Still in Use)
Runtime type validation with `io-ts` is **still used** for:
- Validating external API responses and untrusted data
- Defining codecs: `import * as t from "io-ts";`
- Common codecs in feature utilities (e.g., `ItwCodecUtils.ts`, `fciHeaders.ts`)
- Decode with `codec.decode(data)` which returns `Either<ValidationError[], T>`

## Navigation
Uses React Navigation v6 with typed params:
```tsx
import { useIONavigation } from "../../../navigation/params/AppParamsList";
const navigation = useIONavigation();
navigation.navigate(ITW_ROUTES.MAIN, { screen: ITW_ROUTES.DISCOVERY.INFO });
```

### Adding New Routes
1. **Define the route** in the feature's `navigation/routes.ts` file
2. **Add route params** (if needed) in the feature's `navigation/params.ts` file
3. **Use params in screen** via `RouteProp` from `@react-navigation/native`:
   ```tsx
   import { RouteProp, useRoute } from "@react-navigation/native";
   const route = useRoute<RouteProp<MyParamsList, "MY_ROUTE">>();
   ```
4. **Register the screen** in the feature's navigator component

## Common Gotchas
- Always use relative imports without file extensions
- Prefer `pot` (Pot type) for async data states in reducers
- Feature flags come from remote config selectors in `store/reducers/backendStatus/`
- Use `useIOSelector` and `useIOStore` hooks, not raw `useSelector`
