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
import { AwardPeriodId } from "../../actions/periods";
import {
  BpdTransaction,
  bpdTransactionsLoad
} from "../../actions/transactions";
import { bpdSelectedPeriodSelector } from "./selectedPeriod";

/**
 * Store the transactions foreach period
 * @param state
 * @param action
 */
export const bpdTransactionsReducer = (
  state: IndexedById<pot.Pot<ReadonlyArray<BpdTransaction>, Error>> = {},
  action: Action
): IndexedById<pot.Pot<ReadonlyArray<BpdTransaction>, Error>> => {
  switch (action.type) {
    case getType(bpdTransactionsLoad.request):
      return toLoading(action.payload, state);
    case getType(bpdTransactionsLoad.success):
      return toSome(
        action.payload.awardPeriodId,
        state,
        action.payload.results
      );
    case getType(bpdTransactionsLoad.failure):
      return toError(action.payload.awardPeriodId, state, action.payload.error);
  }

  return state;
};

/**
 * The raw selector to read a specific period of transactions
 * @param state
 * @param periodId
 */
const bpdTransactionsByPeriodSelector = (
  state: GlobalState,
  periodId: AwardPeriodId
): pot.Pot<ReadonlyArray<BpdTransaction>, Error> | undefined =>
  state.bonus.bpd.details.transactions[periodId];

/**
 * Return the pot.Pot for IndexedById<ReadonlyArray<BpdTransaction>>, memoized to avoid recalculations
 */
export const bpdTransactionsSelector = createSelector(
  [bpdTransactionsByPeriodSelector],
  maybePotTransactions => maybePotTransactions ?? pot.none
);

/**
 * Return the list of transactions for the selected period (current displayed)
 */
export const bpdTransactionsForSelectedPeriod = createSelector(
  [
    (state: GlobalState) => state.bonus.bpd.details.transactions,
    bpdSelectedPeriodSelector
  ],
  (transactions, period) =>
    fromNullable(period)
      .chain(p => fromNullable(transactions[p.awardPeriodId]))
      .getOrElse(pot.none)
);
