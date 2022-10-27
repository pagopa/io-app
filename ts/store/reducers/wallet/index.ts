/**
 * A reducer for the wallet, aggregating those for
 * transactions and for cards
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Action, combineReducers } from "redux";
import { PersistConfig, persistReducer } from "redux-persist";
import onboardingReducer, {
  PaymentMethodOnboardingState
} from "../../../features/wallet/onboarding/store";
import abiReducer, {
  AbiState
} from "../../../features/wallet/onboarding/store/abi";
import { DateISO8601Transform } from "../../transforms/dateISO8601Tranform";
import { PotTransform } from "../../transforms/potTransform";
import outcomeCodeReducer, { OutcomeCodeState } from "./outcomeCode";
import paymentReducer, { PaymentState } from "./payment";
import pspsByIdReducer, { PspStateById } from "./pspsById";
import transactionsReducer, { TransactionsState } from "./transactions";
import walletsReducer, { PersistedWalletsState, WalletsState } from "./wallets";

export type WalletState = Readonly<{
  transactions: TransactionsState;
  wallets: PersistedWalletsState;
  payment: PaymentState;
  pspsById: PspStateById;
  // List of banks (abi) found. This data is used atm in the bancomat onboarding
  abi: AbiState;
  // section used for the onboarding of a new payment method. Each payment have a sub-section
  onboarding: PaymentMethodOnboardingState;
  // Section used to know the outcome of the last payment, used both when the user pay or add a credit card.
  lastPaymentOutcomeCode: OutcomeCodeState;
}>;

// A custom configuration to store list of wallets
export const walletsPersistConfig: PersistConfig = {
  key: "wallets",
  storage: AsyncStorage,
  whitelist: ["walletById"],
  transforms: [DateISO8601Transform, PotTransform]
};

const reducer = combineReducers<WalletState, Action>({
  transactions: transactionsReducer,
  wallets: persistReducer<WalletsState, Action>(
    walletsPersistConfig,
    walletsReducer
  ),
  payment: paymentReducer,
  pspsById: pspsByIdReducer,
  abi: abiReducer,
  onboarding: onboardingReducer,
  lastPaymentOutcomeCode: outcomeCodeReducer
});

export default reducer;
