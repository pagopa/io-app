/**
 * A reducer for the wallet, aggregating those for
 * transactions and for cards
 */

import { combineReducers } from "redux";
import { PagoPaState } from "./pagopa";
import pagoPaReducer from "./pagopa";
import {
  PaymentState,
  PaymentStateWithPaymentId,
  PaymentStateWithSelectedPaymentMethod,
  PaymentStateWithVerificaResponse
} from "./payment";
import paymentReducer from "./payment";
import { TransactionsState } from "./transactions";
import transactionsReducer from "./transactions";
import { WalletsState } from "./wallets";
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

/**
 * This represents a WalletState where the payment
 * state is guaranteed to have a paymentId
 * ( + a verifica response)
 */
export type WalletStateWithPaymentId = {
  [T in Exclude<keyof WalletState, "payment">]: WalletState[T]
} &
  Readonly<{
    payment: PaymentStateWithPaymentId;
  }>;

const reducer = combineReducers({
  transactions: transactionsReducer,
  wallets: walletsReducer,
  payment: paymentReducer,
  pagoPa: pagoPaReducer
});

export default reducer;
