/**
 * A reducer for the wallet, aggregating those for
 * transactions and for cards
 */

import { combineReducers } from "redux";
import { PAYMENT_INITIAL_STATE, PaymentState } from "./payment";
import paymentReducer from "./payment";
import { TRANSACTIONS_INITIAL_STATE, TransactionsState } from "./transactions";
import transactionsReducer from "./transactions";
import { WALLETS_INITIAL_STATE, WalletsState } from "./wallets";
import walletsReducer from "./wallets";

export type WalletState = Readonly<{
  transactions: TransactionsState;
  wallets: WalletsState;
  payment: PaymentState;
}>;

export const INITIAL_STATE: WalletState = {
  transactions: TRANSACTIONS_INITIAL_STATE,
  wallets: WALLETS_INITIAL_STATE,
  payment: PAYMENT_INITIAL_STATE
};

const reducer = combineReducers({
  transactions: transactionsReducer,
  wallets: walletsReducer,
  payment: paymentReducer
});

export default reducer;
