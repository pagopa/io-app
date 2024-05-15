import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";

import { Transaction } from "../../../../../types/pagopa";
import {
  getPaymentsLatestTransactionsAction,
  getPaymentsTransactionDetailsAction,
  getPaymentsTransactionsAction
} from "../actions";
import { TransactionListItem } from "../../../../../../definitions/pagopa/biz-events/TransactionListItem";

export type PaymentsTransactionState = {
  details: pot.Pot<Transaction, NetworkError>;
  transactions: pot.Pot<ReadonlyArray<TransactionListItem>, NetworkError>;
  latestTransactions: pot.Pot<ReadonlyArray<TransactionListItem>, NetworkError>;
};

const INITIAL_STATE: PaymentsTransactionState = {
  details: pot.noneLoading,
  transactions: pot.noneLoading,
  latestTransactions: pot.noneLoading
};

const reducer = (
  state: PaymentsTransactionState = INITIAL_STATE,
  action: Action
): PaymentsTransactionState => {
  switch (action.type) {
    // GET TRANSACTION DETAILS
    case getType(getPaymentsTransactionDetailsAction.request):
      return {
        ...state,
        details: pot.toLoading(pot.none)
      };
    case getType(getPaymentsTransactionDetailsAction.success):
      return {
        ...state,
        details: pot.some(action.payload)
      };
    case getType(getPaymentsTransactionDetailsAction.failure):
      return {
        ...state,
        details: pot.toError(state.details, action.payload)
      };
    case getType(getPaymentsTransactionDetailsAction.cancel):
      return {
        ...state,
        details: pot.none
      };
    // GET LATEST TRANSACTIONS LIST
    case getType(getPaymentsLatestTransactionsAction.request):
      return {
        ...state,
        latestTransactions: pot.toLoading(state.transactions)
      };
    case getType(getPaymentsLatestTransactionsAction.success):
      return {
        ...state,
        latestTransactions: pot.some(action.payload)
      };
    case getType(getPaymentsLatestTransactionsAction.failure):
      return {
        ...state,
        latestTransactions: pot.toError(state.transactions, action.payload)
      };
    case getType(getPaymentsLatestTransactionsAction.cancel):
      return {
        ...state,
        latestTransactions: pot.none
      };
    // GET TRANSACTIONS LIST
    case getType(getPaymentsTransactionsAction.request):
      return {
        ...state,
        transactions: pot.toLoading(state.transactions)
      };
    case getType(getPaymentsTransactionsAction.success):
      const previousTransactions = pot.getOrElse(state.transactions, []);
      return {
        ...state,
        transactions: !action.payload.appendElements
          ? pot.some([...previousTransactions, ...action.payload.data])
          : pot.some(action.payload.data)
      };
    case getType(getPaymentsTransactionsAction.failure):
      return {
        ...state,
        transactions: pot.toError(state.transactions, action.payload)
      };
    case getType(getPaymentsTransactionsAction.cancel):
      return {
        ...state,
        transactions: pot.none
      };
  }
  return state;
};

export default reducer;
