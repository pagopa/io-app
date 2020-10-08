/**
 * A reducer for the wallet, aggregating those for
 * transactions and for cards
 */
import { Action, combineReducers } from "redux";
import onboardingReducer, {
  PaymentMethodOnboardingState
} from "../../../features/wallet/onboarding/store";
import abiReducer, {
  AbiState
} from "../../../features/wallet/onboarding/store/abi";
import paymentReducer, { PaymentState } from "./payment";
import pspsByIdReducer, { PspStateById } from "./pspsById";
import transactionsReducer, { TransactionsState } from "./transactions";
import walletsReducer, { WalletsState } from "./wallets";

export type WalletState = Readonly<{
  transactions: TransactionsState;
  wallets: WalletsState;
  payment: PaymentState;
  pspsById: PspStateById;
  // List of banks (abi) found. This data is used atm in the bancomat onboarding
  abi: AbiState;
  // section used for the onboarding of a new payment method. Each payment have a sub-section
  onboarding: PaymentMethodOnboardingState;
}>;

const reducer = combineReducers<WalletState, Action>({
  transactions: transactionsReducer,
  wallets: walletsReducer,
  payment: paymentReducer,
  pspsById: pspsByIdReducer,
  abi: abiReducer,
  onboarding: onboardingReducer
});

export default reducer;
