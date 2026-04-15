import { SagaIterator } from "redux-saga";
import { takeLeading } from "typed-redux-saga/macro";
import { itwLifecycleWalletReset } from "../store/actions";
import { handleWalletInstanceResetSaga } from "./handleWalletInstanceResetSaga";

export function* watchItwLifecycleSaga(): SagaIterator {
  yield* takeLeading(itwLifecycleWalletReset, handleWalletInstanceResetSaga);
}
