import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../actions/types";
import {
  deleteReadTransaction,
  readTransaction
} from "../../actions/wallet/transactions";
import { isProfileEmailValidatedSelector } from "../profile";
import { GlobalState } from "../types";
import { getTransactions } from "../wallet/transactions";

export type ReadTransactionsState = Readonly<{
  [key: string]: number;
}>;

const INITIAL_STATE: ReadTransactionsState = {};

export const transactionsReadReducer = (
  state: ReadTransactionsState = INITIAL_STATE,
  action: Action
): ReadTransactionsState => {
  switch (action.type) {
    case getType(readTransaction): {
      const transactionsId = action.payload.id.toString();
      return {
        ...state,
        [transactionsId]: action.payload.id
      };
    }
    case getType(deleteReadTransaction): {
      // rebuild the state by removing the elements contained in action.payload
      const toDelete = action.payload;
      return Object.keys(state).reduce<ReadTransactionsState>((acc, curr) => {
        if (toDelete.indexOf(state[curr]) !== -1) {
          return acc;
        }
        return { ...acc, [curr]: state[curr] };
      }, {});
    }
    default:
      return state;
  }
};

// selectors
export const getTransactionsRead = (state: GlobalState) =>
  state.entities.transactionsRead;

// filter only unread transactions to account for the residual number
export const getUnreadTransactionsSelector = createSelector(
  [getTransactionsRead, getTransactions],
  (transactionsRead, transactions) =>
    pot.map(transactions, txs =>
      txs.filter(_ => _ !== undefined && transactionsRead[_.id] === undefined)
    )
);

/**
 * This selector returns the number of unread transaction
 * only if the current user has the email validated.
 */
export const getSafeUnreadTransactionsNumSelector = (state: GlobalState) => {
  const transactions = getUnreadTransactionsSelector(state);
  const isEmailValidated = isProfileEmailValidatedSelector(state);

  return pot.isSome(transactions) && isEmailValidated
    ? Object.keys(transactions.value).length
    : 0;
};
