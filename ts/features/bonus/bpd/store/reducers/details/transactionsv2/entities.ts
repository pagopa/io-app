import { getType } from "typesafe-actions";
import { WinningTransactionMilestoneResource } from "../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionMilestoneResource";
import { WinningTransactionPageResource } from "../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionPageResource";
import { Action } from "../../../../../../../store/actions/types";
import {
  IndexedById,
  toArray,
  toIndexed
} from "../../../../../../../store/helpers/indexer";
import {
  AwardPeriodId,
  bpdPeriodsAmountLoadV2
} from "../../../actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadPage,
  BpdTransactionV2
} from "../../../actions/transactions";

export type BpdPivotTransaction = {
  idTrx: BpdTransactionId;
  amount: number;
};

export type BpdTransactionsEntityState = {
  pivot: BpdPivotTransaction | null;
  byId: IndexedById<BpdTransactionV2>;
  nextCursor: number | null;
  foundPivot: boolean;
};
type NormalizedTransactions = {
  data: ReadonlyArray<BpdTransactionV2>;
  found: boolean;
};

const initState: BpdTransactionsEntityState = {
  pivot: null,
  nextCursor: null,
  foundPivot: false,
  byId: {}
};

const getPeriodEntry = (
  state: IndexedById<BpdTransactionsEntityState>,
  id: AwardPeriodId
): BpdTransactionsEntityState => state[id] ?? initState;

const updatePeriodEntry = (
  input: IndexedById<BpdTransactionsEntityState>,
  period: AwardPeriodId,
  newVal: BpdTransactionsEntityState
): IndexedById<BpdTransactionsEntityState> => ({
  ...input,
  [period]: newVal
});

/**
 * Normalize the cashback amount for the transactions, using as ref the pivot transaction
 * - pivot === null, the user did not reach the max cashback amount and all the transactions are valid
 * - pivot !== null && not found && idTrx === pivot.id, pivot transaction found, all the following transaction are whole value
 * - pivot !== null && found, the cashback transaction has the full value
 * @param transactions
 * @param pivot
 */
const normalizeCashback = (
  transactions: ReadonlyArray<WinningTransactionMilestoneResource>,
  pivot: BpdPivotTransaction | null
): NormalizedTransactions => {
  // eslint-disable-next-line functional/no-let
  let found = false;
  return {
    data: transactions.map(x => {
      if (found || pivot === null) {
        return { ...x, validForCashback: true } as BpdTransactionV2;
      }
      if (x.idTrx === pivot.idTrx) {
        found = true;
        return {
          ...x,
          cashback: pivot.amount,
          validForCashback: true
        } as BpdTransactionV2;
      }

      return { ...x, cashback: 0, validForCashback: false } as BpdTransactionV2;
    }),
    found
  };
};

const updateTransactions = (
  state: BpdTransactionsEntityState,
  newPage: WinningTransactionPageResource
): BpdTransactionsEntityState => {
  // eslint-disable-next-line functional/no-let
  let foundPivot = false;

  const flatTransactions = newPage.transactions.reduce<
    IndexedById<BpdTransactionV2>
  >((acc, val) => {
    const pivot = state.pivot;

    const transactionsNormalized = normalizeCashback(val.transactions, pivot);
    if (!foundPivot && transactionsNormalized.found) {
      foundPivot = true;
    }
    return {
      ...acc,
      ...toIndexed(transactionsNormalized.data, x => x.idTrx)
    } as IndexedById<BpdTransactionV2>;
  }, {} as IndexedById<BpdTransactionV2>);

  return {
    ...state,
    nextCursor: newPage.nextCursor ?? null,
    foundPivot,
    byId: { ...state.byId, ...flatTransactions }
  };
};

export const bpdTransactionsEntityReducer = (
  state: IndexedById<BpdTransactionsEntityState> = {},
  action: Action
): IndexedById<BpdTransactionsEntityState> => {
  switch (action.type) {
    case getType(bpdTransactionsLoadPage.success):
      return updatePeriodEntry(
        state,
        action.payload.awardPeriodId,
        updateTransactions(
          getPeriodEntry(state, action.payload.awardPeriodId),
          action.payload.results
        )
      );
    case getType(bpdPeriodsAmountLoadV2.success):
      // when receive a new pivot, should refresh any existing transaction
      // This should never happens but is present in order to avoid inconsistent state
      return action.payload.reduce((acc, val) => {
        const periodEntry = getPeriodEntry(state, val.awardPeriodId);
        const normalizedTransaction = normalizeCashback(
          toArray(periodEntry.byId),
          val.pivot
        );

        return {
          ...acc,
          [val.awardPeriodId]: {
            ...periodEntry,
            pivot: val.pivot,
            byId: toIndexed(normalizedTransaction.data, t => t.idTrx),
            foundPivot: normalizedTransaction.found
          }
        };
      }, state);
  }

  return state;
};
