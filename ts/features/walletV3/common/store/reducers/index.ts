import { combineReducers } from "redux";
import walletOnboardingReducer, {
  WalletOnboardingState
} from "../../../onboarding/store";
import walletPaymentReducer, {
  WalletPaymentState
} from "../../../payment/store/reducers";
import walletDetailsReducer, {
  WalletDetailsState
} from "../../../details/store";
import walletTransactionReducer, {
  WalletTransactionState
} from "../../../transaction/store";

export type WalletState = {
  onboarding: WalletOnboardingState;
  details: WalletDetailsState;
  payment: WalletPaymentState;
  transaction: WalletTransactionState;
};

const walletReducer = combineReducers({
  onboarding: walletOnboardingReducer,
  details: walletDetailsReducer,
  payment: walletPaymentReducer,
  transaction: walletTransactionReducer
});

export default walletReducer;
