/**
 * A reducer for the wallet, with some
 * selectors and type guards
 */

import { Action } from "../../actions/types";
import { WalletTransaction } from "../../types/wallet";
import {
  TRANSACTIONS_FETCHED
} from "../actions/constants";
import { CreditCard } from '../../types/CreditCard';

export type EmptyState = Readonly<{
  hasTransactions: boolean;
  hasCreditCards: boolean;
  hasSelectedCreditCard: boolean;
}>;

export type TransactionsState = Readonly<{
  hasTransactions: true;
  transactions: ReadonlyArray<WalletTransaction>;
}> & (EmptyState | CreditCardsState | SelectedCreditCardState); // allow all combinations of transactions|cards

export type CreditCardsState = Readonly<{
  hasCreditCards: true;
  creditCards: ReadonlyArray<CreditCard>;
}> & EmptyState;

export type SelectedCreditCardState = Readonly<{
  hasSelectedCreditCard: true;
  selectedCreditCardId: number;
}> & CreditCardsState;


export type WalletState =
  | EmptyState
  | TransactionsState
  | CreditCardsState
  | SelectedCreditCardState;

export const INITIAL_STATE: EmptyState = {
  hasTransactions: false,
  hasCreditCards: false,
  hasSelectedCreditCard: false
};

// type guards
export const hasTransactions = (state: WalletState): state is TransactionsState => state.hasTransactions;
export const hasCreditCards = (state: WalletState): state is CreditCardsState => state.hasCreditCards;
export const hasSelectedCreditCard = (state: WalletState): state is SelectedCreditCardState => state.hasSelectedCreditCard;

// selectors
export const latestTransactionsSelector = (state: WalletState): ReadonlyArray<WalletTransaction> => {
  if (hasTransactions(state)) {
    [...state.transactions].sort((a,b) => b.isoDatetime.localeCompare(a.isoDatetime) ).slice(0,5)
  }
  return [];
}

// reducer
const reducer = (
  state: WalletState = INITIAL_STATE,
  action: Action
): WalletState => {
  if (action.type === TRANSACTIONS_FETCHED) {
    return {
      ...state,
      hasTransactions: true,
      transactions: action.payload
    };
  }
  return state;
};

export default reducer;
