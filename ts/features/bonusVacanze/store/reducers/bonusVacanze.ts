import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { BonusList } from "../../types/bonusList";
import { availableBonusListLoad } from "../actions/bonusVacanze";

export type BonusState = Readonly<{
  availableBonuses: pot.Pot<BonusList, Error>;
}>;

const INITIAL_STATE: BonusState = {
  availableBonuses: pot.none
};

const reducer = (
  state: BonusState = INITIAL_STATE,
  action: Action
): BonusState => {
  switch (action.type) {
    case getType(availableBonusListLoad.request):
      return {
        ...state,
        availableBonuses: pot.toLoading(state.availableBonuses)
      };
    case getType(availableBonusListLoad.success):
      return { ...state, availableBonuses: pot.some(action.payload) };
    case getType(availableBonusListLoad.failure):
      return {
        ...state,
        availableBonuses: pot.toError(state.availableBonuses, action.payload)
      };
  }
  return state;
};

// Selectors
export const availableBonuses = (
  state: GlobalState
): pot.Pot<BonusList, Error> => state.bonus.availableBonuses;

export default reducer;
