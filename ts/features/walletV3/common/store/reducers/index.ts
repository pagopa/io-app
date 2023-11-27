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

export type WalletState = {
  onboarding: WalletOnboardingState;
  details: WalletDetailsState;
  payment: WalletPaymentState;
};

const walletReducer = combineReducers({
  onboarding: walletOnboardingReducer,
  details: walletDetailsReducer,
  payment: walletPaymentReducer
});

export default walletReducer;
