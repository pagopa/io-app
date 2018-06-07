import { WalletTransaction } from '../../../types/wallet';
import { Action } from '../../actions/types';
import { TRANSACTIONS_FETCHED, SELECT_TRANSACTION_FOR_DETAILS } from '../../actions/constants';
import { some, none, Option } from 'fp-ts/lib/Option';

export type EmptyState = Readonly<{
  hasTransactions: boolean;
  hasTransactionSelectedForDetails: boolean;
}>;

export type WithTransactionsState = Readonly<{
  hasTransactions: true,
  transactions: ReadonlyArray<WalletTransaction>;
}> & EmptyState;

export type WithSelectedTransactionState = Readonly<{
  hasTransactionSelectedForDetails: true,
  selectedTransactionId: number,
}> & WithTransactionsState;

export type TransactionsState = EmptyState | WithTransactionsState | WithSelectedTransactionState;

export const TRANSACTIONS_INITIAL_STATE: TransactionsState = {
  hasTransactions: false,
  hasTransactionSelectedForDetails: false
};

// type guards
export const hasTransactions = (state: TransactionsState): state is WithTransactionsState => state.hasTransactions;
export const hasTransactionSelectedForDetails = (state: TransactionsState): state is WithSelectedTransactionState => state.hasTransactionSelectedForDetails;


// selectors
export const latestTransactionsSelector = (state: TransactionsState): Option<ReadonlyArray<WalletTransaction>> => {
  if (hasTransactions(state)) {
    return some([...state.transactions].sort((a,b) => b.isoDatetime.localeCompare(a.isoDatetime) ).slice(0,5))
  }
  return none;
}

export const transactionForDetailsSelector = (state: TransactionsState): Option<WalletTransaction> => {
  if (hasTransactionSelectedForDetails(state)) {
    const transaction = state.transactions.find(t => t.id === state.selectedTransactionId);
    if (transaction !== undefined) {
      return some(transaction);
    }
  }
  return none;
}

export const transactionsByCardSelector = (state: TransactionsState, cardId: number): Option<ReadonlyArray<WalletTransaction>> => {
  if (hasTransactions(state)) {
    return some(state.transactions.filter(t => t.cardId === cardId));
  }
  return none;
}

// reducer
const reducer = (
  state: TransactionsState = TRANSACTIONS_INITIAL_STATE,
  action: Action
): TransactionsState => {
  if (action.type === TRANSACTIONS_FETCHED) {
    return {
      ...state,
      hasTransactions: true,
      transactions: action.payload
    };
  }
  if (action.type === SELECT_TRANSACTION_FOR_DETAILS) {
    return {
      ...state,
      hasTransactionSelectedForDetails: true, 
      selectedTransactionId: action.payload.id
    };
  }
  return state;
};

export default reducer;
