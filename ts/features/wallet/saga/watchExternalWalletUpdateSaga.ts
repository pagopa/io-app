import { SagaIterator } from "redux-saga";
import { call, takeLatest } from "typed-redux-saga/macro";
import { externalWalletUpdate } from "../store/actions";
import { handleWalletUpdateSaga } from "./handleWalletUpdateSaga";

/**
 * Saga that watches for external wallet update requests.
 * This saga is triggered only by external deep links from web (Universal Links)
 * and never by app startup or internal navigation.
 */
export function* watchExternalWalletUpdateSaga(): SagaIterator {
  yield* takeLatest(
    externalWalletUpdate,
    function* handleExternalWalletUpdate() {
      // Trigger the actual wallet update saga
      yield* call(handleWalletUpdateSaga);
    }
  );
}
