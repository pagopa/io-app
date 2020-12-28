import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { bpdPeriodsAmountLoad } from "../../actions/periods";

export type lastUpdate = pot.Pot<Date, Error>;

export const bpdLastUpdateReducer = (
  state: lastUpdate = pot.none,
  action: Action
): lastUpdate => {
  switch (action.type) {
    // If the bpd info load succeed set a new date
    case getType(bpdPeriodsAmountLoad.success):
      return pot.some(new Date());
    case getType(bpdPeriodsAmountLoad.request):
      return pot.toLoading(state);
    case getType(bpdPeriodsAmountLoad.failure):
      return pot.toError(state, action.payload);
  }

  return state;
};
