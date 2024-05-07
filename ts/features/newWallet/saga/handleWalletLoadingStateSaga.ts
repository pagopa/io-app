import { delay, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { walletAddCards } from "../store/actions/cards";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { selectWalletCards } from "../store/selectors";

export function* handleWalletLoadingStateSaga(
  timeoutMs: number,
  action: ActionType<typeof walletToggleLoadingState>
) {
  const cards = yield* select(selectWalletCards);
  // The loading state should be enabled only if there aren't already cards in the wallet
  if (action.payload && cards.length === 0) {
    // To disable the loading state we wait for at least on `walletAddCards` action
    // Disable the loading state after timeoutMs in case of no actions received
    yield* race({
      take: take(walletAddCards),
      timeout: delay(timeoutMs)
    });

    yield* put(walletToggleLoadingState(false));
  }
}
