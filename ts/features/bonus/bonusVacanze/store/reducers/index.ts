import { combineReducers } from "redux";
import { Action } from "../../../../../store/actions/types";
import bonusVacanzeActivationReducer, { ActivationState } from "./activation";
import allActiveReducer, { AllActiveState } from "./allActive";
import eligibilityReducer, { EligibilityState } from "./eligibility";

// type alias
export type BonusVacanzeState = {
  activation: ActivationState;
  eligibility: EligibilityState;
  allActive: AllActiveState;
};

const bonusVacanzeReducer = combineReducers<BonusVacanzeState, Action>({
  activation: bonusVacanzeActivationReducer,
  eligibility: eligibilityReducer,
  allActive: allActiveReducer
});

export default bonusVacanzeReducer;
