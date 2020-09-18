import { combineReducers } from "redux";
import { Action } from "../../../../../store/actions/types";
import bonusVacanzeActivationReducer, { ActivationState } from "./activation";
import allActiveReducer, { AllActiveState } from "./allActive";
import availableBonusesReducer, {
  AvailableBonusTypesState
} from "./availableBonusesTypes";
import eligibilityReducer, { EligibilityState } from "./eligibility";

// type alias
type BonusVacanzeState = {
  activation: ActivationState;
  eligibility: EligibilityState;
  allActive: AllActiveState;
};

export type BonusState = Readonly<{
  availableBonusTypes: AvailableBonusTypesState;
  bonusVacanze: BonusVacanzeState;
}>;

const bonusVacanzeReducer = combineReducers<BonusVacanzeState, Action>({
  activation: bonusVacanzeActivationReducer,
  eligibility: eligibilityReducer,
  allActive: allActiveReducer
});

const bonusReducer = combineReducers<BonusState, Action>({
  availableBonusTypes: availableBonusesReducer,
  bonusVacanze: bonusVacanzeReducer
});

export default bonusReducer;
