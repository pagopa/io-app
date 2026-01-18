# IO App - Copilot Instructions

## Project Overview

IO is the Italian government's official mobile app for public services, built with **React Native 0.81** and **TypeScript**. It uses **Redux** for state management and **Redux-Saga** for side effects.

## Build & Development Commands

```bash
# Initial setup
yarn setup              # Install deps + generate APIs + locales
yarn sync               # Full sync including iOS pods (bundle + pod install + generate)

# Running the app
yarn run-ios            # Run iOS simulator
yarn dev:run-android    # Run Android in production debug mode (requires emulator running)

# Before Android emulator: disable hardware keystore check
yarn lollipop_checks:comment    # Comment out keystore check for emulator
yarn lollipop_checks:uncomment  # Re-enable before committing (required)

# Code generation
yarn generate           # Regenerate API models + locales from OpenAPI specs
yarn generate:locales   # Regenerate only locale files from YAML

# Quality checks
yarn test:dev           # Run tests without coverage
yarn test:ci            # Run tests with coverage (CI mode)
yarn lint               # ESLint check
yarn lint-autofix       # ESLint with auto-fix
yarn tsc:noemit         # TypeScript check only
yarn prettier:check     # Check formatting
```

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

Complex features may have sub-features (e.g., `itwallet/issuance/`, `itwallet/presentation/`).

### State Management

- **Actions**: Use `typesafe-actions` with `createStandardAction` or `createAsyncAction`
- **Reducers**: Combine in feature's `store/reducers/index.ts`, register in `ts/features/common/store/reducers/`
- **Selectors**: Use `reselect` for memoization
- **Sagas**: Use `typed-redux-saga/macro` for type-safe generator functions
- **Root saga**: `ts/sagas/index.ts` wires all domain sagas
- **Root reducer**: `ts/store/reducers/index.ts` combines feature reducers

### XState for Complex Flows
IT Wallet (`itwallet/`) uses XState v5 for credential issuance flows:
- Machines in `machine/<name>/machine.ts`
- Actions/actors/guards in dedicated files
- Provider pattern with `@xstate/react` context

### Navigation
Uses React Navigation v6 with typed params:
```tsx
import { useIONavigation } from "../../../navigation/params/AppParamsList";
const navigation = useIONavigation();
navigation.navigate(ITW_ROUTES.MAIN, { screen: ITW_ROUTES.DISCOVERY.INFO });
```

## Code Conventions

### TypeScript & Naming
- Strict TypeScript; avoid `any` unless unavoidable
- Avoid `enum`; prefer string literal unions: `type MyType = "type_a" | "type_b"`
- `camelCase` for files/variables, `CamelCase` for components/classes, `UPPER_SNAKE_CASE` for constants

### File Organization
- **Max 200 lines per file** - prefer modularization over long files
- **One component per file** - unless components are trivially simple and tightly coupled
- Extract reusable logic into custom hooks, utilities, or separate modules

### Components
```tsx
type Props = { /* ... */ };
export const MyComponent = ({ ... }: Props) => { /* ... */ };
```

### Hooks
Use IO-specific hooks instead of raw Redux/Navigation hooks:
- `useIOSelector` instead of `useSelector`
- `useIODispatch` instead of `useDispatch`
- `useIOStore` instead of `useStore`
- `useIONavigation` instead of `useNavigation`

### Design System
Import all UI components from `@pagopa/io-app-design-system`:
```tsx
import { VSpacer, H3, Body, IOColors, useIOToast } from "@pagopa/io-app-design-system";
```
Never create custom typography or spacing.

### Internationalization
Translations in `locales/{it,en,de}/` as YAML. Only Italian (`it`) is mandatory.
```bash
yarn generate:locales  # After modifying YAML files
```
```tsx
import I18n from "../../i18n";
I18n.t("features.itWallet.discovery.title")
```

### Import Restrictions
- Import `I18n` from `ts/i18n.ts`, not from `i18n-js`
- Import pot as `import * as pot from "@pagopa/ts-commons/lib/pot"`, not `{ pot }` from `@pagopa/ts-commons`

## Async State Patterns

### `pot` for Async Data (Active)
```tsx
import * as pot from "@pagopa/ts-commons/lib/pot";
// States: pot.none, pot.noneLoading, pot.some(value), pot.toLoading(pot), pot.toError(pot, error)
// Guards: pot.isNone(), pot.isSome(), pot.isLoading(), pot.isError()
// Utilities in ts/utils/pot.ts: isStrictNone(), foldK(), potFoldWithDefault()
```

### `io-ts` for Runtime Validation (Active)
Used for validating external API responses and untrusted data.

### `fp-ts` (Deprecated - Avoid in New Code)
Use standard TypeScript instead:
- Standard null/undefined checks over `Option<T>`
- Try/catch over `Either<E, A>`
- Native array methods over `pipe()` chains

## Testing

### Running Tests
```bash
yarn test:dev                    # Run tests without coverage
yarn test:ci                     # CI mode with coverage
jest path/to/file.test.ts        # Single test file
jest -t "test name pattern"      # Tests matching pattern
```

### Test Structure
- Co-locate tests in `__tests__/` next to implementation
- Use `renderScreenWithNavigationStoreContext` for screens
- Use `withStore` HOC for components needing store
- Use `expectSaga` for saga integration tests, `testSaga` for unit tests

### Common Test Utilities
```tsx
import { renderScreenWithNavigationStoreContext } from "../../utils/testWrapper";
import { withStore } from "../../utils/jest/withStore";
```

## Error Handling

- Use Sentry only for unexpected failures, not expected flows
- Reuse utilities from `ts/utils/errors.ts`: `getError`, `getNetworkError`, `convertUnknownToError`
- For complex UI, wrap in `Sentry.ErrorBoundary` with fallback

## API Integration

- API clients are auto-generated from OpenAPI specs in `definitions/`
- Run `yarn generate` after spec changes
- Generated types live alongside specs; clients in `ts/api/`

## Analytics

- Mixpanel client centralized in `ts/mixpanel.ts`
- Each feature exposes tracking helpers under `analytics/`
- Call domain helpers (e.g., `trackLoginSpidError`) instead of `mixpanelTrack` directly
