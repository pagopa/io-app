import { Action } from "../../../../store/actions/types";

import { combineReducers } from "redux";
import availableBonusesReducer, {
  AvailableBonusesState
} from "./availableBonuses";
import eligibilityReducer, { EligibilityState } from "./eligibility";

export type BonusState = Readonly<{
  availableBonuses: AvailableBonusesState;
  eligibility: EligibilityState;
}>;

const reducer = combineReducers<BonusState, Action>({
  availableBonuses: availableBonusesReducer,
  eligibility: eligibilityReducer
});

export default reducer;
