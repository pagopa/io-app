import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { delay, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { walletAddCards } from "../store/actions/cards";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { selectWalletCards } from "../store/selectors";

const LOADING_STATE_TIMEOUT = 3000 as Millisecond;

export function* handleWalletLoadingStateSaga(
  action: ActionType<typeof walletToggleLoadingState>
) {
  const cards = yield* select(selectWalletCards);
  if (action.payload && cards.length === 0) {
    yield* race({
      take: take(walletAddCards),
      timeout: delay(LOADING_STATE_TIMEOUT)
    });

    yield* put(walletToggleLoadingState(false));
  }
}
