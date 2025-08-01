import { put, select } from "typed-redux-saga/macro";
import { itwCredentialsEidStatusSelector } from "../store/selectors";
import { itwSetLastEidStatus } from "../../common/store/actions/preferences";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";

/**
 * Saga to handle the last eID status for IT Wallet.
 * This function retrieves the eID status and, if the status exists and the PID
 * has not been obtained with IT Wallet, it dispatches the action
 * to save the last known eID status.
 */
export function* handleItwLastEidStatusSaga() {
  const maybeEidStatus = yield* select(itwCredentialsEidStatusSelector);
  const isL3PID = yield* select(itwLifecycleIsITWalletValidSelector);

  if (!isL3PID && maybeEidStatus) {
    yield* put(itwSetLastEidStatus(maybeEidStatus));
  }
}
