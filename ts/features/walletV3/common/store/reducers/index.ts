import { combineReducers } from "redux";
import walletOnboardingReducer, {
  WalletOnboardingState
} from "../../../onboarding/store";
import walletDetailsReducer, {
  WalletDetailsState
} from "../../../details/store";
import walletTransactionReducer, {
  WalletTransactionState
} from "../../../transaction/store";

export type WalletV3State = {
  onboarding: WalletOnboardingState;
  details: WalletDetailsState;
  transaction: WalletTransactionState;
};

const walletV3Reducer = combineReducers({
  onboarding: walletOnboardingReducer,
  details: walletDetailsReducer,
  transaction: walletTransactionReducer
});

export default walletV3Reducer;
