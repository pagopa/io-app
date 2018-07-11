/**
 * A reducer for the wallet, aggregating those for
 * transactions and for cards
 */

import { combineReducers } from "redux";
import { CARDS_INITIAL_STATE, CardsState } from "./cards";
import cardsReducer from "./cards";
import { PAYMENT_INITIAL_STATE, PaymentState } from "./payment";
import paymentReducer from "./payment";
import { TRANSACTIONS_INITIAL_STATE, TransactionsState } from "./transactions";
import transactionsReducer from "./transactions";

export type WalletState = Readonly<{
  transactions: TransactionsState;
  cards: CardsState;
  payment: PaymentState;
}>;

export const INITIAL_STATE: WalletState = {
  transactions: TRANSACTIONS_INITIAL_STATE,
  cards: CARDS_INITIAL_STATE,
  payment: PAYMENT_INITIAL_STATE
};

const reducer = combineReducers({
  transactions: transactionsReducer,
  cards: cardsReducer,
  payment: paymentReducer
});

export default reducer;
