import { Action, combineReducers } from "redux";
import { RemoteValue } from "../../../model/RemoteValue";
import bpdEligibilityReducer from "./eligibility";
import bpdEnrollReducer from "./enroll";

export type BpdOnboardingState = {
  eligibility: RemoteValue<boolean, Error>;
  enrollOutcome: RemoteValue<boolean, Error>;
};

const bpdOnboardingReducer = combineReducers<BpdOnboardingState, Action>({
  eligibility: bpdEligibilityReducer,
  enrollOutcome: bpdEnrollReducer
});

export default bpdOnboardingReducer;
