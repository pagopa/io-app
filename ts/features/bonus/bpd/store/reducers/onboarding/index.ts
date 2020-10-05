import { Action, combineReducers } from "redux";
import { RemoteValue } from "../../../model/RemoteValue";
import bpdEnrollUserReducer from "./enroll";
import ongoingOnboardingReducer from "./ongoing";

export type BpdOnboardingState = {
  enrollment: RemoteValue<boolean, Error>;
  ongoing: boolean;
};

const bpdOnboardingReducer = combineReducers<BpdOnboardingState, Action>({
  enrollment: bpdEnrollUserReducer,
  ongoing: ongoingOnboardingReducer
});

export default bpdOnboardingReducer;
