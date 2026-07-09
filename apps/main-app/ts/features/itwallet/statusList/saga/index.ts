import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";

import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { checkStatusListCoherenceSaga } from "./checkStatusListCoherenceSaga";
import { registerStatusListFetchTaskSaga } from "./registerStatusListFetchTaskSaga";

export { registerStatusListFetchTaskSaga };

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
  yield* fork(checkStatusListCoherenceSaga);

  // Register Status List super properties
  // TODO [SIW-4474] Add super property registration
  // yield* call(registerStatusListProperties);
}
