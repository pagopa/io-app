/**
 * Reducers, states, selectors and guards for the transactions
 */

import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { values } from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { Transaction } from "../../../types/pagopa";
import { cleanPaymentDescription } from "../../../utils/cleanPaymentDescription";
import { Action } from "../../actions/types";
import {
  fetchTransactionsSuccess,
  selectTransactionForDetails,
  storeNewTransaction
} from "../../actions/wallet/transactions";
import { addToIndexed, IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";
import { getSelectedWalletId } from "./wallets";

export type TransactionsState = Readonly<{
  transactions: IndexedById<Transaction>;
  selectedTransactionId: Option<number>;
}>;

const TRANSACTIONS_INITIAL_STATE: TransactionsState = {
  transactions: {},
  selectedTransactionId: none
};

// selectors
const getTransactions = (state: GlobalState): IndexedById<Transaction> =>
  state.wallet.transactions.transactions;
const getSelectedTransactionId = (state: GlobalState): Option<number> =>
  state.wallet.transactions.selectedTransactionId;

export const latestTransactionsSelector = createSelector(
  getTransactions,
  (transactions: IndexedById<Transaction>) =>
    values(transactions)
      .sort(
        (a, b) =>
          isNaN(a.created as any) || isNaN(b.created as any)
            ? -1 // define behavior for undefined creation dates (pagoPA allows these to be undefined)
            : b.created.toISOString().localeCompare(a.created.toISOString())
      )
      .filter(t => t.statusMessage !== "rifiutato")
      .slice(0, 50) // WIP no magic numbers
);

export const transactionForDetailsSelector = createSelector(
  getTransactions,
  getSelectedTransactionId,
  (
    transactions: IndexedById<Transaction>,
    selectedTransactionId: Option<number>
  ): Option<Transaction> =>
    selectedTransactionId.chain(transactionId =>
      fromNullable(transactions[transactionId])
    )
);

export const transactionsByWalletSelector = createSelector(
  getTransactions,
  getSelectedWalletId,
  (
    transactions: IndexedById<Transaction>,
    walletId: Option<number>
  ): ReadonlyArray<Transaction> =>
    walletId.fold([], wId =>
      values(transactions).filter(t => t.idWallet === wId)
    )
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

    case getType(selectTransactionForDetails):
      return {
        ...state,
        selectedTransactionId: some(action.payload.id)
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
