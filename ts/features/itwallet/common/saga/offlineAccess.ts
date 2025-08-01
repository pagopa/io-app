import { SagaIterator } from "redux-saga";
import { fork, put, select, takeLatest } from "typed-redux-saga/macro";
import { identificationSuccess } from "../../../identification/store/actions";
import { progressSelector as identificationStatusSelector } from "../../../identification/store/selectors";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../walletInstance/store/actions";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../store/actions/securePreferences";

/**
 * Handles the offline access counter reset by listening for the wallet
 * instance status store success actions.
 *
 * The offline access counter is reset when the wallet instance status is updated
 * successfully, indicating that the user has returned online and the wallet instance
 * stattus is refreshed.
 */
function* handleItwOfflineAccessCounterReset(): SagaIterator {
  yield* put(itwOfflineAccessCounterReset());
}

/**
 * Handles the increment of the offline access counter if an offline access reason
 * is set
 */
function* incrementOfflineAccessCounter() {
  const offlineAccessReason = yield* select(offlineAccessReasonSelector);
  if (offlineAccessReason !== undefined) {
    yield* put(itwOfflineAccessCounterUp());
  }
}

/**
 * Handles the increment of the offline access counter when the app start in
 * offline mode and user completes the identification successfully.
 */
function* handleItwOfflineAccessCounterUpOnIdentificationSuccess(): SagaIterator {
  // Get the current identification status to determine if the user has already completed
  // the identification.
  const identificationStatus = yield* select(identificationStatusSelector);

  // If the user already completed the identification successfully
  // call the increment function directly.
  if (identificationStatus.kind === "identified") {
    yield* incrementOfflineAccessCounter();
  } else {
    // Otherwise, wait for the identification success action to be dispatched.
    yield* takeLatest(identificationSuccess, incrementOfflineAccessCounter);
  }
}

/**
 * Watch actions that trigger the offline access counter reset or increment.
 */
export function* watchItwOfflineAccess(): SagaIterator {
  yield* fork(handleItwOfflineAccessCounterUpOnIdentificationSuccess);
  yield* takeLatest(
    itwUpdateWalletInstanceStatus.success,
    handleItwOfflineAccessCounterReset
  );
}
