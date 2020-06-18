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

export type AvailableBonusTypesState = pot.Pot<BonusesAvailable, Error>;

const INITIAL_STATE: AvailableBonusTypesState = pot.none;

const reducer = (
  state: AvailableBonusTypesState = INITIAL_STATE,
  action: Action
): AvailableBonusTypesState => {
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
export const availableBonusTypesSelector = (
  state: GlobalState
): AvailableBonusTypesState => state.bonus.availableBonuses;

export const availableBonusTypesSelectorFromId = (idBonusType: number) =>
  createSelector<GlobalState, AvailableBonusTypesState, Option<BonusAvailable>>(
    availableBonusTypesSelector,
    ab =>
      pot.getOrElse(
        pot.map(ab, abs =>
          fromNullable(abs.find(i => i.id_type === idBonusType))
        ),
        none
      )
  );

export default reducer;
