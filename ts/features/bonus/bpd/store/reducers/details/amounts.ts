import { fromNullable } from "fp-ts/lib/Option";
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
import { bpdSelectedPeriodSelector } from "./selectedPeriod";

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
 * Return all the amounts
 */
export const bpdAllAmountSelector = createSelector<
  GlobalState,
  IndexedById<pot.Pot<BpdAmount, Error>>,
  IndexedById<pot.Pot<BpdAmount, Error>>
>(
  [(state: GlobalState) => state.bonus.bpd.details.amounts],
  amounts => amounts
);

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

/**
 * Return the BpdAmount for the selected period (current displayed)
 */
export const bpdAmountForSelectedPeriod = createSelector(
  [
    (state: GlobalState) => state.bonus.bpd.details.amounts,
    bpdSelectedPeriodSelector
  ],
  (amounts, period) =>
    fromNullable(period)
      .map(p => amounts[p.awardPeriodId] ?? pot.none)
      .getOrElse(pot.none)
);
