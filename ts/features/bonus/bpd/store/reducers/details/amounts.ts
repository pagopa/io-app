import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { IndexedById } from "../../../../../../store/helpers/indexer";
import {
  toError,
  toLoading,
  toSome
} from "../../../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../../../store/reducers/types";
import { BpdAmount, bpdAmountLoad } from "../../actions/amount";
import { AwardPeriodId } from "../../actions/periods";

/**
 * Store the amounts (cashback and transaction count) foreach period
 * @param state
 * @param action
 */
export const bpdAmountsReducer = (
  state: IndexedById<pot.Pot<BpdAmount, Error>> = {},
  action: Action
): IndexedById<pot.Pot<BpdAmount, Error>> => {
  switch (action.type) {
    case getType(bpdAmountLoad.request):
      return toLoading(action.payload, state);
    case getType(bpdAmountLoad.success):
      return toSome(action.payload.awardPeriodId, state, action.payload);
    case getType(bpdAmountLoad.failure):
      return toError(action.payload.awardPeriodId, state, action.payload.error);
  }

  return state;
};

/**
 * The rew selector to read a specific period amount
 * @param state
 * @param periodId
 */
const bpdAmountByPeriodSelector = (
  state: GlobalState,
  periodId: AwardPeriodId
): pot.Pot<BpdAmount, Error> | undefined =>
  state.bonus.bpd.details.amounts[periodId];

/**
 * Return the pot.Pot for IndexedById<BpdAmount>, memoized to avoid recalculations
 */
export const bpdAmountSelector = createSelector(
  [bpdAmountByPeriodSelector],
  maybePotAmount => maybePotAmount ?? pot.none
);
