import { SagaIterator } from "redux-saga";
import { delay, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { itwCredentialsAddPid } from "../store/actions";

/*
 * This saga handles adding new credentials to the wallet.
 * Currenly it consists of a delay and then dispatches the success action, due to the credential being mocked.
 */
export function* handleCredentialsAddPid(
  action: ActionType<typeof itwCredentialsAddPid.request>
): SagaIterator {
  yield* delay(2000);
  yield* put(itwCredentialsAddPid.success(action.payload));
}
