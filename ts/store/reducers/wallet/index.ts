/**
 * A reducer for the wallet, with some
 * selectors and type guards
 */

import { none, Option } from "fp-ts/lib/Option";
import { combineReducers } from "redux";
import { WalletTransaction } from "../../../types/wallet";
import {
  CARDS_INITIAL_STATE,
  CardsState,
  hasCardSelectedForDetails
} from "./cards";
import cardsReducer from "./cards";
import {
  TRANSACTIONS_INITIAL_STATE,
  transactionsByCardSelector,
  TransactionsState
} from "./transactions";
import transactionsReducer from "./transactions";

export type WalletState = Readonly<{
  transactions: TransactionsState;
  cards: CardsState;
}>;

export const INITIAL_STATE: WalletState = {
  transactions: TRANSACTIONS_INITIAL_STATE,
  cards: CARDS_INITIAL_STATE
};

// selectors
// transactionsBySelectedCardSelector requires both the transactions and the
// cards states, hence its positioning here
export const transactionsBySelectedCardSelector = (
  state: WalletState
): Option<ReadonlyArray<WalletTransaction>> => {
  const transactionsState = state.transactions;
  const cardsState = state.cards;
  if (hasCardSelectedForDetails(cardsState)) {
    return transactionsByCardSelector(
      transactionsState,
      cardsState.selectedCardId
    );
  }
  return none;
};

const reducer = combineReducers({
  transactions: transactionsReducer,
  cards: cardsReducer
});

export default reducer;
