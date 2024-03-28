import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import walletDetailsReducer, {
  WalletDetailsState
} from "../../../details/store";
import walletPaymentHistoryReducer, {
  WalletPaymentHistoryState
} from "../../../history/store/reducers";
import walletOnboardingReducer, {
  WalletOnboardingState
} from "../../../onboarding/store";
import walletPaymentReducer, {
  WalletPaymentState
} from "../../../payment/store/reducers";
import walletTransactionReducer, {
  WalletTransactionState
} from "../../../transaction/store";
import paymentsWalletReducer, {
  PaymentsWalletState
} from "../../../wallet/store/reducers";

export type PaymentsState = {
  onboarding: WalletOnboardingState;
  details: WalletDetailsState;
  payment: WalletPaymentState;
  transaction: WalletTransactionState;
  history: WalletPaymentHistoryState & PersistPartial;
  wallet: PaymentsWalletState;
};

const paymentsReducer = combineReducers({
  onboarding: walletOnboardingReducer,
  details: walletDetailsReducer,
  payment: walletPaymentReducer,
  transaction: walletTransactionReducer,
  history: walletPaymentHistoryReducer,
  wallet: paymentsWalletReducer
});

export default paymentsReducer;
