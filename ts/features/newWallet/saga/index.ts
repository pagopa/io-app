import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import { delay, put, race, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { walletAddCards } from "../store/actions/cards";
import { walletToggleLoadingState } from "../store/actions/placeholders";

const LOADING_STATE_TIMEOUT = 3000 as Millisecond;

export function* handleWalletLoadingStateSaga(
  action: ActionType<typeof walletToggleLoadingState>
) {
  if (action.payload) {
    yield* race({
      take: take(walletAddCards),
      timeout: delay(LOADING_STATE_TIMEOUT)
    });

    yield* put(walletToggleLoadingState(false));
  }
}

export function* watchWalletSaga(): SagaIterator {
  yield* takeLatest(walletToggleLoadingState, handleWalletLoadingStateSaga);
}
