import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";

import {
  getPaymentsBizEventsTransactionDetailsAction,
  getPaymentsLatestBizEventsTransactionsAction,
  getPaymentsBizEventsTransactionsAction,
  getPaymentsBizEventsReceiptAction
} from "../actions";
import { TransactionListItem } from "../../../../../../definitions/pagopa/biz-events/TransactionListItem";
import { TransactionDetailResponse } from "../../../../../../definitions/pagopa/biz-events/TransactionDetailResponse";

export type PaymentsBizEventsTransactionState = {
  transactions: pot.Pot<ReadonlyArray<TransactionListItem>, NetworkError>;
  latestTransactions: pot.Pot<ReadonlyArray<TransactionListItem>, NetworkError>;
  details: pot.Pot<TransactionDetailResponse, NetworkError>;
  receiptDocument: pot.Pot<Blob, NetworkError>;
};

const INITIAL_STATE: PaymentsBizEventsTransactionState = {
  transactions: pot.noneLoading,
  latestTransactions: pot.noneLoading,
  details: pot.noneLoading,
  receiptDocument: pot.none
};

const reducer = (
  state: PaymentsBizEventsTransactionState = INITIAL_STATE,
  action: Action
): PaymentsBizEventsTransactionState => {
  switch (action.type) {
    // GET LATEST TRANSACTIONS LIST
    case getType(getPaymentsLatestBizEventsTransactionsAction.request):
      return {
        ...state,
        latestTransactions: pot.toLoading(state.latestTransactions)
      };
    case getType(getPaymentsLatestBizEventsTransactionsAction.success):
      return {
        ...state,
        latestTransactions: pot.some(action.payload.transactions || [])
      };
    case getType(getPaymentsLatestBizEventsTransactionsAction.failure):
      return {
        ...state,
        latestTransactions: pot.toError(
          state.latestTransactions,
          action.payload
        )
      };
    case getType(getPaymentsLatestBizEventsTransactionsAction.cancel):
      return {
        ...state,
        latestTransactions: pot.none
      };
    // GET TRANSACTIONS LIST
    case getType(getPaymentsBizEventsTransactionsAction.request):
      return {
        ...state,
        transactions: pot.toLoading(state.transactions)
      };
    case getType(getPaymentsBizEventsTransactionsAction.success):
      const previousTransactions = pot.getOrElse(state.transactions, []);
      const maybeTransactions = action.payload.data.transactions || [];
      return {
        ...state,
        transactions: !action.payload.appendElements
          ? pot.some([...previousTransactions, ...maybeTransactions])
          : pot.some(maybeTransactions)
      };
    case getType(getPaymentsBizEventsTransactionsAction.failure):
      return {
        ...state,
        transactions: pot.toError(state.transactions, action.payload)
      };
    case getType(getPaymentsBizEventsTransactionsAction.cancel):
      return {
        ...state,
        transactions: pot.none
      };
    // GET BIZ-EVENTS TRANSACTION DETAILS
    case getType(getPaymentsBizEventsTransactionDetailsAction.request):
      return {
        ...state,
        details: pot.toLoading(state.details)
      };
    case getType(getPaymentsBizEventsTransactionDetailsAction.success):
      return {
        ...state,
        details: pot.some(action.payload)
      };
    case getType(getPaymentsBizEventsTransactionDetailsAction.failure):
      return {
        ...state,
        details: pot.toError(state.details, action.payload)
      };
    case getType(getPaymentsBizEventsTransactionDetailsAction.cancel):
      return {
        ...state,
        details: pot.none
      };
    // GET BIZ-EVENTS TRANSACTION RECEIPT PDF
    case getType(getPaymentsBizEventsReceiptAction.request):
      return {
        ...state,
        receiptDocument: pot.noneLoading
      };
    case getType(getPaymentsBizEventsReceiptAction.success):
      return {
        ...state,
        receiptDocument: pot.some(action.payload)
      };
    case getType(getPaymentsBizEventsReceiptAction.failure):
      return {
        ...state,
        receiptDocument: pot.toError(state.receiptDocument, action.payload)
      };
    case getType(getPaymentsBizEventsReceiptAction.cancel):
      return {
        ...state,
        receiptDocument: pot.none
      };
  }
  return state;
};

export default reducer;
