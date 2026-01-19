# Architecture

## Feature-Based Structure

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

Key features: `authentication/`, `itwallet/`, `payments/`, `messages/`, `services/`, `idpay/`, `pn/`.

Complex features may have sub-features (e.g., `itwallet/issuance/`, `itwallet/presentation/`).

## State Management

- **Actions**: `typesafe-actions` with `createStandardAction` or `createAsyncAction`
- **Reducers**: Combine in feature's `store/reducers/index.ts`, register in `ts/features/common/store/reducers/`
- **Selectors**: Use `reselect` for memoization
- **Sagas**: Use `typed-redux-saga/macro` for type-safe generator functions
- **Root saga**: `ts/sagas/index.ts`
- **Root reducer**: `ts/store/reducers/index.ts`

## XState for Complex Flows

IT Wallet (`itwallet/`) uses XState v5 for credential issuance flows:

- Machines in `machine/<name>/machine.ts`
- Actions/actors/guards in dedicated files
- Provider pattern with `@xstate/react` context

## Navigation

React Navigation v6 with typed params:

```tsx
import { useIONavigation } from "../../../navigation/params/AppParamsList";
const navigation = useIONavigation();
navigation.navigate(ITW_ROUTES.MAIN, { screen: ITW_ROUTES.DISCOVERY.INFO });
```
