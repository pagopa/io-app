/**
 * Reducers, states, selectors and guards for the transactions
 */
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { values } from "lodash";
import { createSelector } from "reselect";
import { WalletTransaction } from "../../../types/wallet";
import {
  PAYMENT_STORE_NEW_TRANSACTION,
  SELECT_TRANSACTION_FOR_DETAILS,
  TRANSACTIONS_FETCHED
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { addToIndexed, IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";
import { getSelectedWalletId } from "./wallets";

export type TransactionsState = Readonly<{
  transactions: IndexedById<WalletTransaction>;
  selectedTransactionId: Option<number>;
}>;

export const TRANSACTIONS_INITIAL_STATE: TransactionsState = {
  transactions: {},
  selectedTransactionId: none
};

// selectors
export const getTransactions = (
  state: GlobalState
): IndexedById<WalletTransaction> => state.wallet.transactions.transactions;
export const getSelectedTransactionId = (state: GlobalState): Option<number> =>
  state.wallet.transactions.selectedTransactionId;

export const latestTransactionsSelector = createSelector(
  getTransactions,
  (transactions: IndexedById<WalletTransaction>) =>
    values(transactions)
      .sort((a, b) => b.isoDatetime.localeCompare(a.isoDatetime))
      .slice(0, 5) // WIP no magic numbers
);

export const transactionForDetailsSelector = createSelector(
  getTransactions,
  getSelectedTransactionId,
  (
    transactions: IndexedById<WalletTransaction>,
    selectedTransactionId: Option<number>
  ): Option<WalletTransaction> => {
    if (selectedTransactionId.isSome()) {
      return fromNullable(transactions[selectedTransactionId.value]);
    }
    return none;
  }
);

export const transactionsByWalletSelector = createSelector(
  getTransactions,
  getSelectedWalletId,
  (
    transactions: IndexedById<WalletTransaction>,
    walletId: Option<number>
  ): ReadonlyArray<WalletTransaction> => {
    if (walletId.isSome()) {
      return values(transactions).filter(t => t.cardId === walletId.value);
    }
    return [];
  }
);

// reducer
const reducer = (
  state: TransactionsState = TRANSACTIONS_INITIAL_STATE,
  action: Action
): TransactionsState => {
  if (action.type === TRANSACTIONS_FETCHED) {
    return {
      ...state,
      transactions: toIndexed(action.payload)
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
      transactions: addToIndexed(state.transactions, action.payload)
    };
  }
  return state;
};

export default reducer;
