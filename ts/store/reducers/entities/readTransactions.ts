import * as pot from "italia-ts-commons/lib/pot";
import { values } from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../actions/types";
import { readTransaction } from "../../actions/wallet/transactions";
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
      values(txs).filter(
        _ => _ !== undefined && transactionsRead[_.id] === undefined
      )
    )
);
