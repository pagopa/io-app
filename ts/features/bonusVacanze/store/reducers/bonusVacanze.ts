import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { BonusVacanze } from "../../types/bonusVacanze";
import { loadBonusVacanzeFromId } from "../actions/bonusVacanze";
import availableBonusesReducer, {
  AvailableBonusesState
} from "./availableBonuses";
import eligibilityReducer, { EligibilityState } from "./eligibility";

// type alias
type BonusVacanzeState = pot.Pot<BonusVacanze, Error>;

export type BonusState = Readonly<{
  availableBonuses: AvailableBonusesState;
  eligibility: EligibilityState;
  bonusVacanze: BonusVacanzeState;
}>;

// bonus reducer
const bonusReducer = (
  state: BonusVacanzeState = pot.none,
  action: Action
): BonusVacanzeState => {
  switch (action.type) {
    // available bonuses
    case getType(loadBonusVacanzeFromId.request):
      return pot.toLoading(state);
    case getType(loadBonusVacanzeFromId.success):
      return pot.some(action.payload);
    case getType(loadBonusVacanzeFromId.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

const reducer = combineReducers<BonusState, Action>({
  availableBonuses: availableBonusesReducer,
  eligibility: eligibilityReducer,
  bonusVacanze: bonusReducer
});

export default reducer;
