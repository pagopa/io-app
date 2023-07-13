import { SagaIterator } from "redux-saga";
import { delay, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { itwCredentialsAddPid } from "../store/actions";

/*
 * This saga handles the requirements check for the IT Wallet activation.
 * Currently it checks if the user logged in with CIE or if the device has NFC support.
 */
export function* handleCredentialsAddPid(
  action: ActionType<typeof itwCredentialsAddPid.request>
): SagaIterator {
  yield* delay(2000);
  yield* put(itwCredentialsAddPid.success(action.payload));
}
