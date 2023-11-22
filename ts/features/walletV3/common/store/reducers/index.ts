import { combineReducers } from "redux";
import walletOnboardingReducer, {
  WalletOnboardingState
} from "../../../onboarding/store";
import walletPaymentReducer, {
  WalletPaymentState
} from "../../../payment/store";

export type WalletV3State = {
  onboarding: WalletOnboardingState;
  payment: WalletPaymentState;
};

const walletReducer = combineReducers({
  onboarding: walletOnboardingReducer,
  payment: walletPaymentReducer
});

export default walletReducer;
