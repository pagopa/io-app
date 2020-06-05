import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { BonusActivationStatusEnum } from "../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { loadBonusVacanzeFromId } from "../actions/bonusVacanze";
import availableBonusesReducer, {
  AvailableBonusesState
} from "./availableBonuses";
import eligibilityReducer, { EligibilityState } from "./eligibility";

// type alias
type BonusVacanzeActivationState = pot.Pot<BonusActivationWithQrCode, Error>;

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
// return the bonus vacanze activation pot
export const bonusVacanzeActivationSelector = (
  state: GlobalState
): pot.Pot<BonusActivationWithQrCode, Error> =>
  state.bonus.bonusVacanzeActivation;

/* return true if a bonus vacanze
* - doesn't exists (pot.none)
* - exists but its state is VOIDED or FAILED
*/
export const canBonusVacanzeBeRequestedSelector = createSelector<
  GlobalState,
  pot.Pot<BonusActivationWithQrCode, Error>,
  boolean
>(bonusVacanzeActivationSelector, bv => {
  return pot.getOrElse(
    pot.map(bv, v => v.status === BonusActivationStatusEnum.FAILED),
    true
  );
});

export default reducer;
