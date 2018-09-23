/**
 * Reducers, states, selectors and guards for the transactions
 */
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { values } from "lodash";
import { createSelector } from "reselect";
import { Transaction } from "../../../types/pagopa";
import {
  FETCH_TRANSACTIONS_SUCCESS,
  PAYMENT_STORE_NEW_TRANSACTION,
  SELECT_TRANSACTION_FOR_DETAILS
} from "../../actions/constants";
import { Action } from "../../actions/types";
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

// reducer
const reducer = (
  state: TransactionsState = TRANSACTIONS_INITIAL_STATE,
  action: Action
): TransactionsState => {
  if (action.type === FETCH_TRANSACTIONS_SUCCESS) {
    return {
      ...state,
      transactions: toIndexed(action.payload, "id")
    };
  }
  if (action.type === SELECT_TRANSACTION_FOR_DETAILS) {
    return {
      ...state,
      selectedTransactionId: some(action.payload.id)
    };
  }
  if (action.type === PAYMENT_STORE_NEW_TRANSACTION) {
    return {
      ...state,
      transactions: addToIndexed(state.transactions, action.payload, "id")
    };
  }
  return state;
};

export default reducer;
