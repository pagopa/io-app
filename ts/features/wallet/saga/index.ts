import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import {
  fork,
  put,
  select,
  takeLatest,
  takeLeading
} from "typed-redux-saga/macro";
import { walletUpdate } from "../store/actions";
import { walletAddCards } from "../store/actions/cards";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { selectWalletPlaceholderCards } from "../store/selectors";
import { handleWalletAnalyticsSaga } from "./handleWalletAnalyticsSaga";
import { handleWalletPlaceholdersTimeout } from "./handleWalletLoadingPlaceholdersTimeout";
import { handleWalletLoadingStateSaga } from "./handleWalletLoadingStateSaga";
import { handleWalletUpdateSaga } from "./handleWalletUpdateSaga";

const LOADING_STATE_TIMEOUT = 2000 as Millisecond;

export function* watchWalletSaga(): SagaIterator {
  // Adds persisted placeholders as cards in the wallet
  // to be displayed while waiting for the actual cards
  const placeholders = yield* select(selectWalletPlaceholderCards);
  yield* put(walletAddCards(placeholders));

  yield* takeLatest(
    walletToggleLoadingState,
    handleWalletLoadingStateSaga,
    LOADING_STATE_TIMEOUT
  );

  // Any remaining placeholders are removed after the timeout
  yield* takeLeading(
    walletToggleLoadingState,
    handleWalletPlaceholdersTimeout,
    LOADING_STATE_TIMEOUT
  );

  yield* takeLeading(walletUpdate, handleWalletUpdateSaga);

  yield* fork(handleWalletAnalyticsSaga);
}
