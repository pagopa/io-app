import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { BonusList } from "../../types/bonusList";
import { bonusListLoad } from "../actions/bonusVacanze";
export type BonusState = Readonly<{
  bonuses: pot.Pot<BonusList, Error>;
}>;

const INITIAL_STATE: BonusState = {
  bonuses: pot.none
};

const reducer = (
  state: BonusState = INITIAL_STATE,
  action: Action
): BonusState => {
  switch (action.type) {
    case getType(bonusListLoad.request):
      return { ...state, bonuses: pot.toLoading(state.bonuses) };
    case getType(bonusListLoad.success):
      return { ...state, bonuses: pot.some(action.payload) };
    case getType(bonusListLoad.failure):
      return { ...state, bonuses: pot.toError(state.bonuses, action.payload) };
  }
  return state;
};

// Selectors
export const bonuses = (state: GlobalState): pot.Pot<BonusList, Error> =>
  state.bonus.bonuses;

export default reducer;
