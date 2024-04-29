import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { takeLatest, takeLeading } from "typed-redux-saga/macro";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { handleWalletPlaceholdersTimeout } from "./handleWalletLoadingPlaceholdersTimeout";
import { handleWalletLoadingStateSaga } from "./handleWalletLoadingStateSaga";

const LOADING_STATE_TIMEOUT = 2000 as Millisecond;

export function* watchWalletSaga(): SagaIterator {
  yield* takeLatest(
    walletToggleLoadingState,
    handleWalletLoadingStateSaga,
    LOADING_STATE_TIMEOUT
  );
  yield* takeLeading(
    walletToggleLoadingState,
    handleWalletPlaceholdersTimeout,
    LOADING_STATE_TIMEOUT
  );
}
