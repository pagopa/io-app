import { Action, combineReducers } from "redux";
import bpdDetailsReducer, { BdpDetailsState } from "./details";
import bpdOnboardingReducer, { BpdOnboardingState } from "./onboarding";

export type BpdState = {
  onboarding: BpdOnboardingState;
  details: BdpDetailsState;
};

const bpdReducer = combineReducers<BpdState, Action>({
  onboarding: bpdOnboardingReducer,
  details: bpdDetailsReducer
});

export default bpdReducer;
