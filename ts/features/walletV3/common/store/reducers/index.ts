import { combineReducers } from "redux";
import walletOnboardingReducer, {
  WalletOnboardingState
} from "../../../onboarding/store";
import walletDetailsReducer, {
  WalletDetailsState
} from "../../../details/store";

export type WalletV3State = {
  onboarding: WalletOnboardingState;
  details: WalletDetailsState;
};

const walletV3Reducer = combineReducers({
  onboarding: walletOnboardingReducer,
  details: walletDetailsReducer
});

export default walletV3Reducer;
