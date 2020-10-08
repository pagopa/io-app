/**
 * A reducer for the wallet, aggregating those for
 * transactions and for cards
 */
import { combineReducers } from "redux";
import abiReducer, {
  AbiState
} from "../../../features/wallet/onboarding/bancomat/store/reducers/abi";
import bancomatReducer, {
  BancomatState
} from "../../../features/wallet/onboarding/bancomat/store/reducers/bancomat";
import { PaymentState } from "./payment";
import paymentReducer from "./payment";
import pspsByIdReducer, { PspStateById } from "./pspsById";
import { TransactionsState } from "./transactions";
import transactionsReducer from "./transactions";
import { WalletsState } from "./wallets";
import walletsReducer from "./wallets";

export type WalletState = Readonly<{
  transactions: TransactionsState;
  wallets: WalletsState;
  payment: PaymentState;
  pspsById: PspStateById;
  abi: AbiState;
  bancomat: BancomatState;
}>;

const reducer = combineReducers({
  transactions: transactionsReducer,
  wallets: walletsReducer,
  payment: paymentReducer,
  pspsById: pspsByIdReducer,
  abi: abiReducer,
  bancomat: bancomatReducer
});

export default reducer;
