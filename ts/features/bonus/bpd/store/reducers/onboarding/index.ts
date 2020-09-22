import { Action, combineReducers } from "redux";
import { RemoteValue } from "../../../model/RemoteValue";
import bpdEnrollReducer from "./enroll";

export type BpdOnboardingState = {
  enrollOutcome: RemoteValue<boolean, Error>;
};

const bpdOnboardingReducer = combineReducers<BpdOnboardingState, Action>({
  enrollOutcome: bpdEnrollReducer
});

export default bpdOnboardingReducer;
