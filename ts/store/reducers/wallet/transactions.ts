/**
 * Reducers, states, selectors and guards for the transactions
 */

import { values } from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { Transaction } from "../../../types/pagopa";
import { cleanPaymentDescription } from "../../../utils/cleanPaymentDescription";
import { Action } from "../../actions/types";
import {
  fetchTransactionsSuccess,
  storeNewTransaction
} from "../../actions/wallet/transactions";
import { addToIndexed, IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type TransactionsState = Readonly<{
  transactions: IndexedById<Transaction>;
}>;

const TRANSACTIONS_INITIAL_STATE: TransactionsState = {
  transactions: {}
};

// selectors
export const getTransactions = (
  state: GlobalState
): ReadonlyArray<Transaction> => values(state.wallet.transactions.transactions);

export const latestTransactionsSelector = createSelector(
  getTransactions,
  (transactions: ReadonlyArray<Transaction>) =>
    [...transactions]
      .sort(
        (a, b) =>
          isNaN(a.created as any) || isNaN(b.created as any)
            ? -1 // define behavior for undefined creation dates (pagoPA allows these to be undefined)
            : b.created.toISOString().localeCompare(a.created.toISOString())
      )
      .filter(t => t.statusMessage !== "rifiutato")
      .slice(0, 50) // WIP no magic numbers
);

const cleanDescription = ({ description, ...transaction }: Transaction) => {
  const cleanedDescription = cleanPaymentDescription(description);

  return { ...transaction, description: cleanedDescription };
};

// reducer
const reducer = (
  state: TransactionsState = TRANSACTIONS_INITIAL_STATE,
  action: Action
): TransactionsState => {
  switch (action.type) {
    case getType(fetchTransactionsSuccess):
      return {
        ...state,
        transactions: toIndexed(action.payload.map(cleanDescription), "id")
      };

    case getType(storeNewTransaction):
      return {
        ...state,
        transactions: addToIndexed(state.transactions, action.payload, "id")
      };

    default:
      return state;
  }
};

export default reducer;
