import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { handleWalletLoadingStateSaga } from "./handleWalletLoadingStateSaga";

export function* watchWalletSaga(): SagaIterator {
  yield* takeLatest(walletToggleLoadingState, handleWalletLoadingStateSaga);
}
