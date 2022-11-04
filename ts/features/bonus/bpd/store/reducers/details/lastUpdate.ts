import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { bpdAllData } from "../../actions/details";

export type lastUpdate = pot.Pot<Date, Error>;

export const bpdLastUpdateReducer = (
  state: lastUpdate = pot.none,
  action: Action
): lastUpdate => {
  switch (action.type) {
    // If the bpd info load succeed set a new date
    case getType(bpdAllData.success):
      return pot.some(new Date());
    case getType(bpdAllData.request):
      return pot.toLoading(state);
    case getType(bpdAllData.failure):
      return pot.toError(state, action.payload);
  }

  return state;
};

export const bpdLastUpdateSelector = (state: GlobalState) =>
  state.bonus.bpd.details.lastUpdate;
