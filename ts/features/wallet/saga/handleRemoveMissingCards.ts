import { put, select } from "typed-redux-saga/macro";
import { GlobalState } from "../../../store/reducers/types";
import { walletRemoveCards } from "../store/actions/cards";
import { WalletCard } from "../types";

/** * Saga to remove wallet cards that are missing from the latest API response, based on type filter
 * @param currentCards - The current wallet cards in the state
 * @param keys - The set of keys that are present in the latest API response
 * @param type - Optional type filter to only remove cards of a specific type
 */

export function* handleRemoveMissingCards(
  keys: Set<string>,
  type: WalletCard["type"]
) {
  const state: GlobalState = yield* select();

  const currentCards = state.features.wallet.cards;

  const keysToRemove = Object.keys(currentCards).filter(
    key => currentCards[key].type === type && !keys.has(key)
  );

  if (keysToRemove.length > 0) {
    yield* put(walletRemoveCards(keysToRemove));
  }
}
