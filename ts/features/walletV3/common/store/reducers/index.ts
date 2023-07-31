import { combineReducers } from "redux";
import walletOnboardingReducer, {
  WalletOnboardingState
} from "../../../onboarding/store";

export type WalletV3State = {
  onboarding: WalletOnboardingState;
};

const walletV3Reducer = combineReducers({
  onboarding: walletOnboardingReducer
});

export default walletV3Reducer;
