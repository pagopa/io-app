/**
 * Reducers, states, selectors and guards for the transactions
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { WalletTransaction } from "../../../types/wallet";
import {
  SELECT_TRANSACTION_FOR_DETAILS,
  TRANSACTIONS_FETCHED
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { IndexedObject } from "../../helpers/indexer";
import { GlobalState } from "../types";
import { getSelectedCreditCardId } from "./cards";

export type TransactionsState = Readonly<{
  transactions: IndexedObject<WalletTransaction>;
  selectedTransactionId: Option<number>;
}>;

export const TRANSACTIONS_INITIAL_STATE: TransactionsState = {
  transactions: IndexedObject.create([]),
  selectedTransactionId: none
};

// selectors
export const getTransactions = (
  state: GlobalState
): IndexedObject<WalletTransaction> => state.wallet.transactions.transactions;
export const getSelectedTransactionId = (state: GlobalState): Option<number> =>
  state.wallet.transactions.selectedTransactionId;

export const latestTransactionsSelector = createSelector(
  getTransactions,
  (transactions: IndexedObject<WalletTransaction>) =>
    [...transactions.values()]
      .sort((a, b) => b.isoDatetime.localeCompare(a.isoDatetime))
      .slice(0, 5) // WIP no magic numbers
);

export const transactionForDetailsSelector = createSelector(
  getTransactions,
  getSelectedTransactionId,
  (
    transactions: IndexedObject<WalletTransaction>,
    selectedTransactionId: Option<number>
  ): Option<WalletTransaction> => {
    if (selectedTransactionId.isSome()) {
      return transactions.get(selectedTransactionId.value);
    }
    return none;
  }
);

export const transactionsByCardSelector = createSelector(
  getTransactions,
  getSelectedCreditCardId,
  (
    transactions: IndexedObject<WalletTransaction>,
    cardId: Option<number>
  ): ReadonlyArray<WalletTransaction> => {
    if (cardId.isSome()) {
      return transactions.values().filter(t => t.cardId === cardId.value);
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
      transactions: IndexedObject.create(action.payload)
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
