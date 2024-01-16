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
import walletAnalyticsReducer, {
  WalletAnalyticsState
} from "../../../analytics/store/reducers";

export type WalletState = {
  analytics: WalletAnalyticsState;
  onboarding: WalletOnboardingState;
  details: WalletDetailsState;
  payment: WalletPaymentState;
  transaction: WalletTransactionState;
};

const walletReducer = combineReducers({
  analytics: walletAnalyticsReducer,
  onboarding: walletOnboardingReducer,
  details: walletDetailsReducer,
  payment: walletPaymentReducer,
  transaction: walletTransactionReducer
});

export default walletReducer;
