import { put, select } from "typed-redux-saga/macro";
import { clearPaymentsPendingActions } from "../store/actions";
import { selectPagoPaPlatformPendingActions } from "../store/selectors";

/**
 * This handler is used to resume the pending actions that were waiting for the PagoPA session token.
 * It is called after the session token is successfully retrieved.
 */
export function* handleResumePaymentsPendingActions() {
  const pendingActions = yield* select(selectPagoPaPlatformPendingActions);
  // if there are no pending actions,
  // we don't need to wait for anything,
  // because there is no saga to restart
  // with the pending actions
  if (pendingActions.length === 0) {
    return;
  }
  for (const action of pendingActions) {
    yield* put(action);
  }
  yield* put(clearPaymentsPendingActions());
}
