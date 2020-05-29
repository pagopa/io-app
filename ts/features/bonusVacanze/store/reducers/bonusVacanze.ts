import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { BonusVacanze } from "../../types/bonusVacanze";
import { loadBonusVacanzeFromId } from "../actions/bonusVacanze";
import availableBonusesReducer, {
  AvailableBonusesState
} from "./availableBonuses";
import eligibilityReducer, { EligibilityState } from "./eligibility";

// type alias
type BonusVacanzeActivationState = pot.Pot<BonusVacanze, Error>;

export type BonusState = Readonly<{
  availableBonuses: AvailableBonusesState;
  eligibility: EligibilityState;
  bonusVacanzeActivation: BonusVacanzeActivationState;
}>;

// bonus reducer
const bonusVacanzeActivationReducer = (
  state: BonusVacanzeActivationState = pot.none,
  action: Action
): BonusVacanzeActivationState => {
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
  bonusVacanzeActivation: bonusVacanzeActivationReducer
});

// Selectors
export const bonusVacanzeActivationSelector = (
  state: GlobalState
): pot.Pot<BonusVacanze, Error> => state.bonus.bonusVacanzeActivation;

export default reducer;
