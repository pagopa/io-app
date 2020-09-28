import { Action, combineReducers } from "redux";
import { RemoteValue } from "../../../model/RemoteValue";
import bpdEnrollUserReducer from "./enroll";

export type BpdOnboardingState = {
  enrollment: RemoteValue<boolean, Error>;
};

const bpdOnboardingReducer = combineReducers<BpdOnboardingState, Action>({
  enrollment: bpdEnrollUserReducer
});

export default bpdOnboardingReducer;
