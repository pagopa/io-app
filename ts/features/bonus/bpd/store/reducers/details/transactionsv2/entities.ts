import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { WinningTransactionMilestoneResource } from "../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionMilestoneResource";
import { WinningTransactionPageResource } from "../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionPageResource";
import { Action } from "../../../../../../../store/actions/types";
import {
  IndexedById,
  toArray,
  toIndexed
} from "../../../../../../../store/helpers/indexer";
import { AwardPeriodId } from "../../../actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadMilestone,
  bpdTransactionsLoadPage,
  BpdTransactionV2
} from "../../../actions/transactions";

export type BpdPivotTransaction = {
  idTrx: BpdTransactionId;
  amount: number;
};

export type BpdTransactionsEntityState = {
  pivot: pot.Pot<BpdPivotTransaction | null, Error>;
  byId: IndexedById<BpdTransactionV2>;
  foundPivot: boolean;
};
type NormalizedTransactions = {
  data: ReadonlyArray<BpdTransactionV2>;
  found: boolean;
};

const initState: BpdTransactionsEntityState = {
  pivot: pot.none,
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
 * - pivot !== null && not found, the transactions have 0 value
 * - pivot !== null && not found && idTrx === pivot.id, pivot transaction found, the pivot transaction have pivot.amount
 * - pivot !== null && found, the cashback transaction has the complete value
 * @param transactions
 * @param pivot
 * @param foundPivot
 */
const normalizeCashback = (
  transactions: ReadonlyArray<WinningTransactionMilestoneResource>,
  pivot: BpdPivotTransaction | null,
  foundPivot: boolean
): NormalizedTransactions => {
  // eslint-disable-next-line functional/no-let
  let found = foundPivot;
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

/**
 * Add a new page data to BpdTransactionsEntityState for a specific period, updating it
 * @param state
 * @param newPage
 */
const updateTransactions = (
  state: BpdTransactionsEntityState,
  newPage: WinningTransactionPageResource
): BpdTransactionsEntityState => {
  // eslint-disable-next-line functional/no-let
  let foundPivot = state.foundPivot;

  const pivot = pot.getOrElse(state.pivot, null);
  const flatTransactions = newPage.transactions.reduce<
    IndexedById<BpdTransactionV2>
  >((acc, val) => {
    // calculate the normalization for the new page
    const transactionsNormalized = normalizeCashback(
      val.transactions,
      pivot,
      state.foundPivot
    );
    // update the foundPivot
    if (!foundPivot && transactionsNormalized.found) {
      foundPivot = true;
    }
    return {
      ...acc,
      ...toIndexed(transactionsNormalized.data, x => x.idTrx)
    } as IndexedById<BpdTransactionV2>;
  }, {} as IndexedById<BpdTransactionV2>);

  // append the new normalized transactions to the previously calculated and update the foundPivot
  return {
    ...state,
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

    case getType(bpdTransactionsLoadMilestone.request):
      const periodMilestoneRequest = getPeriodEntry(state, action.payload);
      return {
        ...state,
        [action.payload]: {
          ...periodMilestoneRequest,
          pivot: pot.toLoading(periodMilestoneRequest.pivot)
        }
      };
    case getType(bpdTransactionsLoadMilestone.success):
      // When receive a new pivot, should refresh any existing transaction
      // This should never happens but is present in order to avoid inconsistent state
      const periodMilestoneSuccess = getPeriodEntry(
        state,
        action.payload.awardPeriodId
      );
      const { data, found } = normalizeCashback(
        toArray(periodMilestoneSuccess.byId),
        action.payload.result,
        periodMilestoneSuccess.foundPivot
      );
      return {
        ...state,
        [action.payload.awardPeriodId]: {
          ...periodMilestoneSuccess,
          pivot: pot.some(action.payload.result),
          byId: toIndexed(data, t => t.idTrx),
          foundPivot: found
        }
      };

    case getType(bpdTransactionsLoadMilestone.failure):
      const periodMilestoneFailure = getPeriodEntry(
        state,
        action.payload.awardPeriodId
      );
      return {
        ...state,
        [action.payload.awardPeriodId]: {
          ...periodMilestoneFailure,
          pivot: pot.toError(periodMilestoneFailure.pivot, action.payload.error)
        }
      };
  }

  return state;
};
