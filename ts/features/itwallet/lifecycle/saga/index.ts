import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { itwLifecycleWalletReset } from "../store/actions";
import { handleWalletInstanceReset } from "./handleWalletInstanceResetSaga";

export function* watchItwLifecycleSaga(): SagaIterator {
  yield* takeLatest(itwLifecycleWalletReset, handleWalletInstanceReset);
}