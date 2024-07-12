import { delay, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  walletResetPlaceholders,
  walletToggleLoadingState
} from "../store/actions/placeholders";
import {
  selectWalletCards,
  selectWalletPlaceholders
} from "../store/selectors";
import { walletAddCards } from "../store/actions/cards";

export function* handleWalletPlaceholdersTimeout(
  timeoutMs: number,
  action: ActionType<typeof walletToggleLoadingState>
) {
  if (action.payload) {
    // Adds persisted placeholders as cards in the wallet
    const placeholders = yield* select(selectWalletPlaceholders);
    yield* put(walletAddCards(placeholders));

    // We wait for timeoutMs ms and then remove any pending placeholder from the store
    yield* delay(timeoutMs);
    const cards = yield* select(selectWalletCards);
    yield* put(walletResetPlaceholders(cards));
  }
}
