/**
 * A reducer for the wallet, aggregating those for
 * transactions and for cards
 */

import { combineReducers } from "redux";
import { PAGOPA_INITIAL_STATE, PagoPaState } from "./pagopa";
import pagoPaReducer from "./pagopa";
import {
  PAYMENT_INITIAL_STATE,
  PaymentState,
  PaymentStateWithSelectedPaymentMethod,
  PaymentStateWithVerificaResponse
} from "./payment";
import paymentReducer from "./payment";
import { TRANSACTIONS_INITIAL_STATE, TransactionsState } from "./transactions";
import transactionsReducer from "./transactions";
import { WALLETS_INITIAL_STATE, WalletsState } from "./wallets";
import walletsReducer from "./wallets";

export type WalletState = Readonly<{
  transactions: TransactionsState;
  wallets: WalletsState;
  payment: PaymentState;
  pagoPa: PagoPaState;
}>;

/**
 * This represents a WalletState where the payment
 * state is guaranteed to have received a "verifica"
 * response (i.e. it has the payment information stored)
 */
export type WalletStateWithVerificaResponse = {
  [T in Exclude<keyof WalletState, "payment">]: WalletState[T]
} &
  Readonly<{
    payment: PaymentStateWithVerificaResponse;
  }>;

/**
 * This represents a WalletState where the payment
 * state is guaranteed to have a selected payment method
 * ( + a verifica response)
 */
export type WalletStateWithSelectedPaymentMethod = {
  [T in Exclude<keyof WalletState, "payment">]: WalletState[T]
} &
  Readonly<{
    payment: PaymentStateWithSelectedPaymentMethod;
  }>;

export const INITIAL_STATE: WalletState = {
  transactions: TRANSACTIONS_INITIAL_STATE,
  wallets: WALLETS_INITIAL_STATE,
  payment: PAYMENT_INITIAL_STATE,
  pagoPa: PAGOPA_INITIAL_STATE
};

const reducer = combineReducers({
  transactions: transactionsReducer,
  wallets: walletsReducer,
  payment: paymentReducer,
  pagoPa: pagoPaReducer
});

export default reducer;
