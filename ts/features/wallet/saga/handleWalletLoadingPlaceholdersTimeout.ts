import { delay, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  walletResetPlaceholders,
  walletToggleLoadingState
} from "../store/actions/placeholders";
import { selectWalletCards } from "../store/selectors";

export function* handleWalletPlaceholdersTimeout(
  timeoutMs: number,
  action: ActionType<typeof walletToggleLoadingState>
) {
  if (action.payload) {
    // We wait for timeoutMs ms and then remove any pending placeholder from the store
    yield* delay(timeoutMs);
    const cards = yield* select(selectWalletCards);
    yield* put(walletResetPlaceholders(cards));
    yield* put(walletToggleLoadingState(false));
  }
}
