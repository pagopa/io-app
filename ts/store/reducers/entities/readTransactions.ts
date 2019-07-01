
import * as pot from "italia-ts-commons/lib/pot";
import { values } from 'lodash';
import { Transaction } from '../../../types/pagopa';
import { readTransaction } from '../../actions/wallet/transactions';
import { GlobalState } from '../types';
import { Action } from '../../actions/types';
import { getType } from 'typesafe-actions';


// Search transaction number in Set of read transactions
export const isReadTransaction = (state: GlobalState, txid: number) => {
  return state.entities.transactionsRead[txid] !== undefined;
}

// filter only unread transactions to account for the residual number
export const getUnreadTransactions = (state: GlobalState) =>
  pot.map(
    state.wallet.transactions.transactions,
    txs => 
      values(txs).filter(
        _ =>  _ !== undefined && !isReadTransaction(state, _.id)
      ) as ReadonlyArray<Transaction> // ridurre a array di ID
  );

export type ReadTransactionsState = Readonly<{
  [key:string]: number;
  }>;

const INITIAL_STATE: ReadTransactionsState = {};

export const transactionsReadReducer = (
  state: ReadTransactionsState = INITIAL_STATE,
  action: Action
): ReadTransactionsState => {
  switch(action.type) {
    case getType(readTransaction): {
      const transactionsRead = action.payload.id.toString();
      return {
        ...state,
        [transactionsRead]: action.payload.id
      };
    }
    default:
        return state;
  }
}