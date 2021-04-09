import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../../store/actions/types";
import {
  IndexedById,
  toIndexed
} from "../../../../../../../store/helpers/indexer";
import { AwardPeriodId } from "../../../actions/periods";
import { bpdTransactionsLoadCountByDay } from "../../../actions/transactions";

type BpdTransactionsDayInfo = {
  trxDate: Date;
  count: number;
};

export type BpdTransactionsDaysInfoState = {
  byId: pot.Pot<IndexedById<BpdTransactionsDayInfo>, Error>;
};

const initState: BpdTransactionsDaysInfoState = {
  byId: pot.none
};

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

const getPeriodEntry = (
  state: IndexedById<BpdTransactionsDaysInfoState>,
  id: AwardPeriodId
) => state[id] ?? initState;

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
        pot.some(toIndexed(action.payload.results, x => x.trxDate.toString()))
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
