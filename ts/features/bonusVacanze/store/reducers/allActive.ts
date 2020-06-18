import { Action } from "../../../../store/actions/types";
import { getType } from "typesafe-actions";
import { loadBonusVacanzeFromId } from "../actions/bonusVacanze";
import * as pot from "italia-ts-commons/lib/pot";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { GlobalState } from "../../../../store/reducers/types";
import { createSelector } from "reselect";

export type AllActiveState = {
  [key: string]: pot.Pot<BonusActivationWithQrCode, Error>;
};
const INITIAL_STATE = {};
const reducer = (
  state: AllActiveState = INITIAL_STATE,
  action: Action
): AllActiveState => {
  switch (action.type) {
    // bonus from id
    case getType(loadBonusVacanzeFromId.request):
      const cachedValue = state[action.payload];
      const a = {
        ...state,
        [action.payload]: cachedValue ? pot.toLoading(cachedValue) : pot.none
      };
      return a;
    case getType(loadBonusVacanzeFromId.success):
      return { ...state, [action.payload.id]: pot.some(action.payload) };
    case getType(loadBonusVacanzeFromId.failure):
      const cachedValueE = state[action.payload.id];
      return {
        ...state,
        [action.payload.id]: pot.toError(cachedValueE, action.payload.error)
      };
  }
  return state;
};

// selectors

// return an object where the key is the id of the bonus and the value the bonus pot
export const allBonusActiveByIdSelector = (
  state: GlobalState
): AllActiveState => state.bonus.bonusVacanze.allActive;

// return an array of bonus active pots
export const allBonusActiveSelector = createSelector<
  GlobalState,
  AllActiveState,
  ReadonlyArray<pot.Pot<BonusActivationWithQrCode, Error>>
>(allBonusActiveByIdSelector, allActiveObj => {
  return Object.keys(allActiveObj).map(k => allActiveObj[k]);
});

export default reducer;
