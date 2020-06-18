import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import bonusVacanzeActivationReducer, { ActivationState } from "./activation";
import allActiveReducer, { AllActiveState } from "./allActive";
import availableBonusesReducer, {
  AvailableBonusesState
} from "./availableBonuses";
import eligibilityReducer, { EligibilityState } from "./eligibility";

// type alias
type BonusVacanzeState = {
  activation: ActivationState;
  eligibility: EligibilityState;
  allActive: AllActiveState;
};

export type BonusState = Readonly<{
  availableBonuses: AvailableBonusesState;
  bonusVacanze: BonusVacanzeState;
}>;

const bonusVacanzeReducer = combineReducers<BonusVacanzeState, Action>({
  activation: bonusVacanzeActivationReducer,
  eligibility: eligibilityReducer,
  allActive: allActiveReducer
});

const bonusReducer = combineReducers<BonusState, Action>({
  availableBonuses: availableBonusesReducer,
  bonusVacanze: bonusVacanzeReducer
});

export default bonusReducer;
