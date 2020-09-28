import { Action, combineReducers } from "redux";
import bpdDetailsReducer, { BpdDetailsState } from "./details";
import bpdOnboardingReducer, { BpdOnboardingState } from "./onboarding";

export type BpdState = {
  details: BpdDetailsState;
  onboarding: BpdOnboardingState;
};

const bpdReducer = combineReducers<BpdState, Action>({
  details: bpdDetailsReducer,
  onboarding: bpdOnboardingReducer
});

export default bpdReducer;
