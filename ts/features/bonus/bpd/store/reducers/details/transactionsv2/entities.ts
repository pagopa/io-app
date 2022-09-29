import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import { WinningTransactionMilestoneResource } from "../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionMilestoneResource";
import { WinningTransactionPageResource } from "../../../../../../../../definitions/bpd/winning_transactions_v2/WinningTransactionPageResource";
import { Action } from "../../../../../../../store/actions/types";
import {
  IndexedById,
  toArray,
  toIndexed
} from "../../../../../../../store/helpers/indexer";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { convertCircuitTypeCode } from "../../../../saga/networking/transactions";
import { HPan } from "../../../actions/paymentMethods";
import { AwardPeriodId } from "../../../actions/periods";
import {
  BpdTransactionId,
  bpdTransactionsLoadMilestone,
  bpdTransactionsLoadPage,
  bpdTransactionsLoadRequiredData,
  BpdTransactionV2
} from "../../../actions/transactions";
import { bpdSelectedPeriodSelector } from "../selectedPeriod";

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
      // prepare the base BpdTransactionV2, with the right types
      const trxV2WithCircuit: BpdTransactionV2 = {
        ...x,
        circuitType: convertCircuitTypeCode(x.circuitType),
        awardPeriodId: x.awardPeriodId as AwardPeriodId,
        hashPan: x.hashPan as HPan,
        validForCashback: false,
        idTrx: x.idTrx as BpdTransactionId,
        isPivot: false
      };

      if (found || pivot === null) {
        return { ...trxV2WithCircuit, validForCashback: true };
      }
      if (x.idTrx === pivot.idTrx) {
        found = true;
        return {
          ...trxV2WithCircuit,
          cashback: pivot.amount,
          validForCashback: true,
          isPivot: true
        };
      }

      return { ...trxV2WithCircuit, cashback: 0, validForCashback: false };
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
      foundPivot
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
    case getType(bpdTransactionsLoadRequiredData.request):
      return {};
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
        action.payload.result ?? null,
        periodMilestoneSuccess.foundPivot
      );
      return {
        ...state,
        [action.payload.awardPeriodId]: {
          ...periodMilestoneSuccess,
          pivot: pot.some(action.payload.result ?? null),
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

/**
 * Return the pot.Pot<BpdPivotTransaction | null, Error>,  for the selected period
 */
export const bpdTransactionsPivotForSelectedPeriodSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.bpd.details.transactionsV2.entitiesByPeriod,
    bpdSelectedPeriodSelector
  ],
  (
    bpdTransactionsEntity,
    maybeSelectedPeriod
  ): pot.Pot<BpdPivotTransaction | null, Error> =>
    pipe(
      maybeSelectedPeriod,
      O.fromNullable,
      O.chain(selectedPeriod =>
        O.fromNullable(bpdTransactionsEntity[selectedPeriod.awardPeriodId])
      ),
      O.map(x => x.pivot),
      O.getOrElseW(() => pot.none)
    )
);
