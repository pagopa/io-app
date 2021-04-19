import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../../store/actions/types";
import {
  IndexedById,
  toIndexed
} from "../../../../../../../store/helpers/indexer";
import { AwardPeriodId } from "../../../actions/periods";
import { bpdTransactionsLoadCountByDay } from "../../../actions/transactions";

export type BpdTransactionsDayInfo = {
  trxDate: Date;
  count: number;
};

export type BpdTransactionsDaysInfoState = {
  // the DaysInfo are requested in bulk for a specific period, for this reason all the IndexedById object is a pot
  byId: pot.Pot<IndexedById<BpdTransactionsDayInfo>, Error>;
};

const initState: BpdTransactionsDaysInfoState = {
  byId: pot.none
};

/**
 * Update the byId entry for the selected period
 * @param input
 * @param period
 * @param newVal
 */
const updateById = (
  input: IndexedById<BpdTransactionsDaysInfoState>,
  period: AwardPeriodId,
  newVal: pot.Pot<IndexedById<BpdTransactionsDayInfo>, Error>
): IndexedById<BpdTransactionsDaysInfoState> => ({
  ...input,
  [period]: {
    byId: newVal
  }
});

/**
 * Get the BpdTransactionsDaysInfoState for a specific period
 * @param state
 * @param id
 */
const getPeriodEntry = (
  state: IndexedById<BpdTransactionsDaysInfoState>,
  id: AwardPeriodId
): BpdTransactionsDaysInfoState => state[id] ?? initState;

export const bpdTransactionsDaysInfoReducer = (
  state: IndexedById<BpdTransactionsDaysInfoState> = {},
  action: Action
): IndexedById<BpdTransactionsDaysInfoState> => {
  switch (action.type) {
    case getType(bpdTransactionsLoadCountByDay.request):
      return updateById(
        state,
        action.payload,
        pot.toLoading(getPeriodEntry(state, action.payload).byId)
      );
    case getType(bpdTransactionsLoadCountByDay.success):
      return updateById(
        state,
        action.payload.awardPeriodId,
        pot.some(
          toIndexed(action.payload.results, x => x.trxDate.toISOString())
        )
      );
    case getType(bpdTransactionsLoadCountByDay.failure):
      const periodIdError = action.payload.awardPeriodId;
      return updateById(
        state,
        periodIdError,
        pot.toError(
          getPeriodEntry(state, periodIdError).byId,
          action.payload.error
        )
      );
  }
  return state;
};
