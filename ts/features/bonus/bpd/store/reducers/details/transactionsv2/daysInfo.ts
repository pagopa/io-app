import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import { Action } from "../../../../../../../store/actions/types";
import {
  IndexedById,
  toArray,
  toIndexed
} from "../../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { AwardPeriodId } from "../../../actions/periods";
import {
  bpdTransactionsLoadCountByDay,
  bpdTransactionsLoadRequiredData
} from "../../../actions/transactions";
import { bpdSelectedPeriodSelector } from "../selectedPeriod";

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
    case getType(bpdTransactionsLoadRequiredData.request):
      return {};
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

/**
 * Return the pot.Pot<ReadonlyArray<BpdTransactionsDayInfo>, Error>, for the selected period
 */
export const bpdDaysInfoForSelectedPeriodSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.daysInfoByPeriod,
    bpdSelectedPeriodSelector
  ],
  (
    daysInfoByPeriod,
    selectedPeriod
  ): pot.Pot<ReadonlyArray<BpdTransactionsDayInfo>, Error> =>
    pot.map(
      pipe(
        selectedPeriod,
        O.fromNullable,
        O.chain(periodId =>
          O.fromNullable(daysInfoByPeriod[periodId.awardPeriodId]?.byId)
        ),
        O.getOrElseW(() => pot.none)
      ),
      byId => toArray(byId)
    )
);

/**
 * From id to Option<BpdTransactionsDayInfo>
 */
export const bpdDaysInfoByIdSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.ui.awardPeriodId,
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.daysInfoByPeriod,
    (_: GlobalState, daysInfoId: string) => daysInfoId
  ],
  (
    awardPeriodId,
    daysInfoByPeriod,
    daysInfoId
  ): O.Option<BpdTransactionsDayInfo> =>
    pipe(
      awardPeriodId,
      O.fromNullable,
      O.chain(periodId => O.fromNullable(daysInfoByPeriod[periodId]?.byId)),
      O.chain(pot.toOption),
      O.chain(daysInfoById => O.fromNullable(daysInfoById[daysInfoId]))
    )
);
