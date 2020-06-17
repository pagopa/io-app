import { fromNullable, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BonusesAvailable } from "../../../../../definitions/content/BonusesAvailable";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { availableBonuses } from "../../data/availableBonuses";
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
      // if there are some errors and no data into the store -> return hardcoded fallback data
      return pot.toError(
        pot.isNone(state) ? pot.some(availableBonuses) : state,
        action.payload
      );
  }
  return state;
};

// Selectors
export const availableBonusesSelector = (
  state: GlobalState
): AvailableBonusesState => state.bonus.availableBonuses;

export const availableBonusesSelectorFromId = (idBonusType: number) =>
  createSelector<GlobalState, AvailableBonusesState, Option<BonusAvailable>>(
    availableBonusesSelector,
    ab =>
      pot.getOrElse(
        pot.map(ab, abs =>
          fromNullable(abs.find(i => i.id_type === idBonusType))
        ),
        none
      )
  );

export default reducer;
