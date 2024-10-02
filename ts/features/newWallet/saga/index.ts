import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { put, select, takeLatest, takeLeading } from "typed-redux-saga/macro";
import { walletAddCards } from "../store/actions/cards";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { selectWalletPlaceholders } from "../store/selectors";
import { handleWalletPlaceholdersTimeout } from "./handleWalletLoadingPlaceholdersTimeout";
import { handleWalletLoadingStateSaga } from "./handleWalletLoadingStateSaga";

const LOADING_STATE_TIMEOUT = 2000 as Millisecond;

export function* watchWalletSaga(): SagaIterator {
  // Adds persisted placeholders as cards in the wallet
  const placeholders = yield* select(selectWalletPlaceholders);
  yield* put(walletAddCards(placeholders));

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
