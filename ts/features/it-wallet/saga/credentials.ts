import { SagaIterator } from "redux-saga";
import { put } from "typed-redux-saga/macro";
import { itwLifecycleValid } from "../store/actions";

/*
 * This saga handles adding a PID to the wallet.
 * As a side effect, it sets the lifecycle of the wallet to valid.
 */
export function* handleCredentialsAddPid(): SagaIterator {
  yield* put(itwLifecycleValid());
}
