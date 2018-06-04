/**
 * A reducer for the wallet, with some
 * selectors and type guards
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
  hasTransactionForDetails: boolean;
  hasTransactionsList: boolean;
  transactions: ReadonlyArray<WalletTransaction>;
  transactionsList: ReadonlyArray<number>;
  hasSelectedCreditCard: boolean;
}>;

export type SelectedTransactionState = Readonly<{
  hasTransactionForDetails: true;
  transactionIdForDetails: number;
}> &
  EmptyState;

export type TransactionsListState = Readonly<{
  hasTransactionsList: true;
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
  hasTransactionForDetails: false,
  hasTransactionsList: false,
  hasSelectedCreditCard: false,
  transactions: [],
  transactionsList: []
};

// type guards
export const hasTransactionForDetails = (
  state: WalletState
): state is SelectedTransactionState => state.hasTransactionForDetails;
export const hasTransactionsList = (
  state: WalletState
): state is TransactionsListState => state.hasTransactionsList;
export const hasSelectedCreditCard = (
  state: WalletState
): state is SelectedCreditCardState => state.hasSelectedCreditCard;

// selectors

/**
 * Selector for the "transaction for details".
 * The state stores an id for the requested transactions,
 * and a list of all the transactions. This selector
 * iterates on the list to find the one with the matching id
 * @param walletState the wallet state from which the transaction should be extracted
 */
export const transactionForDetailsSelector = (
  walletState: SelectedTransactionState
): WalletTransaction => {
  const transaction = walletState.transactions.find(
    (t: WalletTransaction) => t.id === walletState.transactionIdForDetails
  );
  return transaction === undefined ? UNKNOWN_TRANSACTION : transaction;
};

/**
 * Selector for the list of selected transactions.
 * If a list of transactions has been selected (e.g. latest
 * transactions on transactions by card), a list of ids is stored.
 * This selector matches the selected ids with the actual objects
 * @param walletState the wallet state from which the transactions list should be extracted
 */
export const transactionsListSelector = (
  walletState: TransactionsListState
): ReadonlyArray<WalletTransaction> => {
  return walletState.transactionsList.map(id => {
    const transaction = walletState.transactions.find(t => t.id === id);
    return transaction === undefined ? UNKNOWN_TRANSACTION : transaction;
  });
};

/**
 * Identifies the transaction ids of the
 * latest transactions
 * @param walletState wallet state from which the latest transactions sould be extracted
 */
// WIP no magic numbers
// WIP sort by date/time
export const latestTransactionsListSelector = (
  walletState: WalletState
): ReadonlyArray<number> => walletState.transactions.slice(0, 5).map(t => t.id);

/**
 * Extracts the transactions ids of the
 * transactions given a selected credit card
 * (which is also part of the state)
 * @param walletState wallet state (SelectedCreditCardState) from which the transactions
 *                    sould be extracted this state also contains the selected credit card
 */
export const transactionsListByCardSelector = (
  walletState: SelectedCreditCardState
): ReadonlyArray<number> =>
  walletState.transactions
    .filter(t => t.cardId === walletState.selectedCardId)
    .map(t => t.id);

// reducer
const reducer = (
  state: WalletState = INITIAL_STATE,
  action: Action
): WalletState => {
  if (action.type === SHOW_TRANSACTION_DETAILS) {
    return {
      ...state,
      hasTransactionForDetails: true,
      transactionIdForDetails: action.payload
    };
  }
  if (action.type === LOAD_LATEST_TRANSACTIONS_LIST) {
    return {
      ...state,
      hasTransactionsList: true,
      transactionsList: latestTransactionsListSelector(state)
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
      hasSelectedCreditCard: true,
      selectedCardId: action.payload
    };
  }
  if (
    action.type === LOAD_TRANSACTIONS_LIST_BY_SELECTED_CARD &&
    hasSelectedCreditCard(state)
  ) {
    return {
      ...state,
      transactionsList: transactionsListByCardSelector(state)
    };
  }
  return state;
};

export default reducer;
