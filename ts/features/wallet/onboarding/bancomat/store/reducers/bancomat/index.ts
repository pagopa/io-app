import { combineReducers } from "redux";
import onboardingReducer, { OnboardingState } from "./onboarding";

export type BancomatState = {
  onboarding: OnboardingState;
};

const reducer = combineReducers({
  onboarding: onboardingReducer
});
export default reducer;
