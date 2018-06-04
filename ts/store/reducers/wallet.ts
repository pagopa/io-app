/**
 * A reducer for the wallet
 */

import { Action } from "../../actions/types";
import { UNKNOWN_TRANSACTION, WalletTransaction } from "../../types/wallet";
import {
  LOAD_LATEST_TRANSACTIONS_LIST,
  LOAD_TRANSACTIONS_LIST_BY_SELECTED_CARD,
  SELECT_CARD,
  SHOW_TRANSACTION_DETAILS,
  TRANSACTIONS_FETCHED
} from "../actions/constants";

export type EmptyState = Readonly<{
  hasTransaction: boolean;
  hasTransactions: boolean;
  transactions: ReadonlyArray<WalletTransaction>;
  transactionsList: ReadonlyArray<number>;
  hasCreditCard: boolean;
}>;

export type SelectedTransactionState = Readonly<{
  hasTransaction: true;
  selectedTransactionId: number;
}> &
  EmptyState;

export type TransactionsListState = Readonly<{
  hasTransactions: true;
  transactionsList: ReadonlyArray<number>;
}> &
  EmptyState;

export type SelectedCreditCardState = Readonly<{
  hasCreditCard: true;
  selectedCardId: number;
}> &
  EmptyState;

export type WalletState =
  | EmptyState
  | SelectedTransactionState
  | TransactionsListState
  | SelectedCreditCardState;

export const INITIAL_STATE: EmptyState = {
  hasTransaction: false,
  hasTransactions: false,
  hasCreditCard: false,
  transactions: [],
  transactionsList: []
};

// typeguard(s)
export const hasSelectedTransaction = (
  state: WalletState
): state is SelectedTransactionState => state.hasTransaction;
export const hasSelectedTransactions = (
  state: WalletState
): state is TransactionsListState => state.hasTransactions;
export const hasSelectedCreditCard = (
  state: WalletState
): state is SelectedCreditCardState => state.hasCreditCard;

// selectors
export const transactionSelector = (
  walletState: SelectedTransactionState
): WalletTransaction => {
  const transaction = walletState.transactions.find(
    (t: WalletTransaction) => t.id === walletState.selectedTransactionId
  );
  return transaction === undefined ? UNKNOWN_TRANSACTION : transaction;
};

export const transactionsSelector = (
  walletState: TransactionsListState
): ReadonlyArray<WalletTransaction> => {
  return walletState.transactionsList.map(id => {
    const transaction = walletState.transactions.find(t => t.id === id);
    return transaction === undefined ? UNKNOWN_TRANSACTION : transaction;
  });
};

export const latestTransactionsSelector = (
  walletState: WalletState
): ReadonlyArray<number> => walletState.transactions.slice(0, 5).map(t => t.id); // WIP no magic numbers, WIP return ids

export const transactionsByCardSelector = (
  walletState: SelectedCreditCardState
): ReadonlyArray<number> =>
  walletState.transactions
    .filter(t => t.cardId === walletState.selectedCardId)
    .map(t => t.id);

const reducer = (
  state: WalletState = INITIAL_STATE,
  action: Action
): WalletState => {
  if (action.type === SHOW_TRANSACTION_DETAILS) {
    return {
      ...state,
      hasTransaction: true,
      selectedTransactionId: action.payload
    };
  }
  if (action.type === LOAD_LATEST_TRANSACTIONS_LIST) {
    return {
      ...state,
      hasTransactions: true,
      transactionsList: latestTransactionsSelector(state)
    };
  }
  if (action.type === TRANSACTIONS_FETCHED) {
    return {
      ...state,
      transactions: action.payload
    };
  }
  if (action.type === SELECT_CARD) {
    return {
      ...state,
      hasCreditCard: true,
      selectedCardId: action.payload
    };
  }
  if (
    action.type === LOAD_TRANSACTIONS_LIST_BY_SELECTED_CARD &&
    hasSelectedCreditCard(state)
  ) {
    return {
      ...state,
      transactionsList: transactionsByCardSelector(state)
    };
  }
  return state;
};

export default reducer;
