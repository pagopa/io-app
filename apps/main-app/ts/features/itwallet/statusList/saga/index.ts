import { SagaIterator } from "redux-saga";
import { call, fork, select } from "typed-redux-saga/macro";

import { itwIsL3EnabledSelector } from "../../common/store/selectors";
import { checkStatusListCoherenceSaga } from "./checkStatusListCoherenceSaga";
import { refreshStaleStatusListsSaga } from "./refreshStaleStatusListsSaga";
import { registerStatusListFetchTaskSaga } from "./registerStatusListFetchTaskSaga";

export function* watchItwStatusListSaga(): SagaIterator {
  const isWhitelisted = yield* select(itwIsL3EnabledSelector);
  if (!isWhitelisted) {
    // If the user is not whitelisted for L3 features, we can skip background
    // task sagas as they won't have access to IT Wallet features that require
    // status list checks.
    return;
  }

  // Register the background task for Status List fetch only for active wallet instances
  yield* fork(registerStatusListFetchTaskSaga);

  // Run startup coherence for the Status List Token cache
  yield* call(checkStatusListCoherenceSaga);
  // Check for stale Status List Tokens and refresh them in the background
  yield* call(refreshStaleStatusListsSaga);

  // Register Status List super properties
  // TODO [SIW-4474] Add super property registration
  // yield* call(registerStatusListProperties);
}
