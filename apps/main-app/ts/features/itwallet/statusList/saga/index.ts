import { SagaIterator } from "redux-saga";
import { fork, select } from "typed-redux-saga/macro";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { checkStatusListCoherenceSaga } from "./checkStatusListCoherenceSaga";

export function* watchItwStatusListSaga(): SagaIterator {
  const isWhitelisted = yield* select(itwIsL3EnabledSelector);
  if (!isWhitelisted) {
    // If the user is not whitelisted for L3 features, we can skip status list
    // sagas as they won't have access to IT Wallet features that require
    // status list checks.
    return;
  }

  // Run startup coherence for the Status List Token cache
  yield* fork(checkStatusListCoherenceSaga);
}
