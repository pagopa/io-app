import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { BonusesAvailable } from "../../../../../../definitions/content/BonusesAvailable";
import { clearCache } from "../../../../settings/common/store/actions";
import { Action } from "../../../../../store/actions/types";
import { loadAvailableBonuses } from "../actions/availableBonusesTypes";

export type AvailableBonusTypesState = pot.Pot<BonusesAvailable, Error>;

const INITIAL_STATE: AvailableBonusTypesState = pot.none;

const reducer = (
  state: AvailableBonusTypesState = INITIAL_STATE,
  action: Action
): AvailableBonusTypesState => {
  switch (action.type) {
    case getType(loadAvailableBonuses.request):
      return pot.toLoading(state);
    case getType(loadAvailableBonuses.success):
      return pot.some(action.payload);
    case getType(loadAvailableBonuses.failure):
      return pot.toError(state, action.payload);
    case getType(clearCache):
      return INITIAL_STATE;
  }
  return state;
};

export default reducer;
