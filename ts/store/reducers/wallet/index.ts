/**
 * A reducer for the wallet, aggregating those for
 * transactions and for cards
 */

import { combineReducers } from "redux";
import { PagoPaState } from "./pagopa";
import pagoPaReducer from "./pagopa";
import { PaymentState } from "./payment";
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

const reducer = combineReducers({
  transactions: transactionsReducer,
  wallets: walletsReducer,
  payment: paymentReducer,
  pagoPa: pagoPaReducer
});

export default reducer;
