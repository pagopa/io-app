/**
 * Reducers, states, selectors and guards for the transactions
 */
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import _ from "lodash";
import { createSelector } from "reselect";
import { WalletTransaction } from "../../../types/wallet";
import {
  SELECT_TRANSACTION_FOR_DETAILS,
  TRANSACTIONS_FETCHED
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";
import { getSelectedCreditCardId } from "./cards";

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
    _
      .values(transactions)
      .sort((a, b) => b.datetime.localeCompare(a.datetime))
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

export const transactionsByCardSelector = createSelector(
  getTransactions,
  getSelectedCreditCardId,
  (
    transactions: IndexedById<WalletTransaction>,
    cardId: Option<number>
  ): ReadonlyArray<WalletTransaction> => {
    if (cardId.isSome()) {
      return _.values(transactions).filter(t => t.cardId === cardId.value);
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
  return state;
};

export default reducer;
