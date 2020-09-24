import { Action, combineReducers } from "redux";
import bpdDetailsReducer, { BdpDetailsState } from "./details";
import bpdOnboardingReducer, { BpdOnboardingState } from "./onboarding";

export type BpdState = {
  details: BdpDetailsState;
  onboarding: BpdOnboardingState;
};

const bpdReducer = combineReducers<BpdState, Action>({
  details: bpdDetailsReducer,
  onboarding: bpdOnboardingReducer
});

export default bpdReducer;
