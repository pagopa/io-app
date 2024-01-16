import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import walletAnalyticsReducer, {
  WalletAnalyticsState
} from "../../../analytics/store/reducers";
import walletDetailsReducer, {
  WalletDetailsState
} from "../../../details/store";
import walletOnboardingReducer, {
  WalletOnboardingState
} from "../../../onboarding/store";
import walletPaymentReducer, {
  WalletPaymentState
} from "../../../payment/store/reducers";
import walletTransactionReducer, {
  WalletTransactionState
} from "../../../transaction/store";

export type WalletState = {
  analytics: WalletAnalyticsState & PersistPartial;
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
