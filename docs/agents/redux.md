## State Management

### Redux + `typesafe-actions`

Define actions with `createAction` / `createAsyncAction` from `typesafe-actions`:

```ts
// store/actions/index.ts
import { createAsyncAction } from "typesafe-actions";

export const loadFoo = createAsyncAction(
  "FOO_LOAD_REQUEST",
  "FOO_LOAD_SUCCESS",
  "FOO_LOAD_FAILURE"
)<RequestPayload, SuccessPayload, Error>();
```

**After adding new actions**: export them from the feature's `store/actions/index.ts` **and** add the union type to `ts/store/actions/types.ts` (`Action` union).

**After adding new reducers**: register them in the feature's `store/reducers/index.ts` via `combineReducers` and add the slice type to `ts/store/reducers/types.ts` (`GlobalState`).

### Redux-Saga (`typed-redux-saga`)

- Always import saga effects from `typed-redux-saga/macro` for full type inference.
- Workers should be typed `SagaIterator`.
- Use `withRefreshApiCall` for authenticated endpoints that require automatic token refresh.
- Validate API responses with `io-ts` codecs; surface validation errors with `readableReport`.

```ts
import { call, put, select } from "typed-redux-saga/macro";
import { SagaIterator } from "redux-saga";

export function* myWorkerSaga(action: ActionType<typeof myAction.request>): SagaIterator {
  const token = yield* select(sessionTokenSelector);
  // ...
}
```

### Store Hooks

Use typed wrappers — **never** raw `useSelector` / `useDispatch` / `useStore`:

```ts
import { useIOSelector, useIODispatch, useIOStore } from "../store/hooks";
```