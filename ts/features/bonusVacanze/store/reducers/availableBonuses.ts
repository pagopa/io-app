import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { BonusesAvailable } from "../../types/bonusesAvailable";
import { availableBonusesLoad } from "../actions/bonusVacanze";

export type AvailableBonusesState = pot.Pot<BonusesAvailable, Error>;

const INITIAL_STATE: AvailableBonusesState = pot.none;

const reducer = (
  state: AvailableBonusesState = INITIAL_STATE,
  action: Action
): AvailableBonusesState => {
  switch (action.type) {
    // available bonuses
    case getType(availableBonusesLoad.request):
      return pot.toLoading(state);
    case getType(availableBonusesLoad.success):
      return pot.some(action.payload);
    case getType(availableBonusesLoad.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

// Selectors
export const availableBonusesSelector = (
  state: GlobalState
): pot.Pot<BonusesAvailable, Error> => state.bonus.availableBonuses;

export default reducer;
