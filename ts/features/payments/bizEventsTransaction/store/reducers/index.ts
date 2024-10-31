/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";

import { NoticeDetailResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { NoticeListItem } from "../../../../../../definitions/pagopa/biz-events/NoticeListItem";
import {
  getPaymentsBizEventsReceiptAction,
  getPaymentsBizEventsTransactionDetailsAction,
  getPaymentsBizEventsTransactionsAction,
  getPaymentsLatestBizEventsTransactionsAction,
  hidePaymentsBizEventsReceiptAction,
  PaymentsTransactionReceiptInfoPayload
} from "../actions";
import {
  filterTransactionsByIdAndGetIndex,
  getTransactionByIndex,
  restoreTransactionAtIndex
} from "../../utils";

type CancelTransactionRecord = NoticeListItem & {
  index: number;
  cancelType: "transactions" | "latestTransactions";
};

export type PaymentsBizEventsTransactionState = {
  transactions: pot.Pot<ReadonlyArray<NoticeListItem>, NetworkError>;
  latestTransactions: pot.Pot<ReadonlyArray<NoticeListItem>, NetworkError>;
  details: pot.Pot<NoticeDetailResponse, NetworkError>;
  receiptDocument: pot.Pot<PaymentsTransactionReceiptInfoPayload, NetworkError>;
  cancelTransactionRecord: pot.Pot<CancelTransactionRecord, NetworkError>;
};

const INITIAL_STATE: PaymentsBizEventsTransactionState = {
  transactions: pot.noneLoading,
  latestTransactions: pot.none,
  details: pot.noneLoading,
  receiptDocument: pot.none,
  cancelTransactionRecord: pot.none
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
        latestTransactions: pot.some(action.payload || [])
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
      const maybeTransactions = action.payload.data || [];
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
    case getType(hidePaymentsBizEventsReceiptAction.request): {
      const { filteredTransactions, removedIndex: transactionIndex } =
        filterTransactionsByIdAndGetIndex(
          state.transactions,
          action.payload.transactionId
        );

      const {
        filteredTransactions: filteredLatestTransactions,
        removedIndex: latestTransactionIndex
      } = filterTransactionsByIdAndGetIndex(
        state.latestTransactions,
        action.payload.transactionId
      );

      return {
        ...state,
        cancelTransactionRecord: pot.some({
          ...(transactionIndex > -1
            ? getTransactionByIndex(state.transactions, transactionIndex)
            : getTransactionByIndex(
                state.latestTransactions,
                latestTransactionIndex
              )),
          index:
            transactionIndex > -1 ? transactionIndex : latestTransactionIndex,
          cancelType:
            transactionIndex > -1 ? "transactions" : "latestTransactions"
        }),
        transactions: pot.some(filteredTransactions),
        latestTransactions: pot.some(filteredLatestTransactions)
      };
    }
    case getType(hidePaymentsBizEventsReceiptAction.failure): {
      const restoreValue = pot.getOrElse(state.cancelTransactionRecord, null);
      if (!restoreValue) {
        return state;
      }

      const { cancelType, index, ...restoreItem } = restoreValue;

      return {
        ...state,
        transactions:
          cancelType !== "latestTransactions"
            ? restoreTransactionAtIndex(state.transactions, restoreItem, index)
            : state.transactions,
        latestTransactions:
          cancelType === "latestTransactions"
            ? restoreTransactionAtIndex(
                state.latestTransactions,
                restoreItem,
                index
              )
            : state.latestTransactions
      };
    }
  }
  return state;
};

export default reducer;
