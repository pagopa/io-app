/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable complexity */
import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";

import { NoticeDetailResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { NoticeListItem } from "../../../../../../definitions/pagopa/biz-events/NoticeListItem";
import {
  getPaymentsReceiptDownloadAction,
  getPaymentsReceiptDetailsAction,
  getPaymentsReceiptAction,
  getPaymentsLatestReceiptAction,
  hidePaymentsReceiptAction,
  setNeedsHomeListRefreshAction,
  PaymentsTransactionReceiptInfoPayload
} from "../actions";
import {
  filterTransactionsByIdAndGetIndex,
  restoreTransactionsToOriginalOrder
} from "../../utils";
import { ReceiptDownloadFailure } from "../../types";

type CancelTransactionRecord = {
  removedItems: Array<NoticeListItem>;
  removedIndices: Array<number>;
  cancelType: "transactions" | "latestTransactions";
};

export type ReceiptTransactionState = {
  transactions: pot.Pot<ReadonlyArray<NoticeListItem>, NetworkError>;
  latestTransactions: pot.Pot<ReadonlyArray<NoticeListItem>, NetworkError>;
  latestTransactionsContinuationToken?: string;
  details: pot.Pot<NoticeDetailResponse, NetworkError>;
  receiptDocument: pot.Pot<
    PaymentsTransactionReceiptInfoPayload,
    NetworkError | ReceiptDownloadFailure
  >;
  cancelTransactionRecord: pot.Pot<CancelTransactionRecord, NetworkError>;
  needsHomeListRefresh: boolean;
};

const INITIAL_STATE: ReceiptTransactionState = {
  transactions: pot.noneLoading,
  latestTransactions: pot.none,
  latestTransactionsContinuationToken: undefined,
  details: pot.noneLoading,
  receiptDocument: pot.none,
  cancelTransactionRecord: pot.none,
  needsHomeListRefresh: false
};

const reducer = (
  state: ReceiptTransactionState = INITIAL_STATE,
  action: Action
): ReceiptTransactionState => {
  switch (action.type) {
    // GET LATEST TRANSACTIONS LIST
    case getType(getPaymentsLatestReceiptAction.request):
      return {
        ...state,
        latestTransactions: pot.toLoading(state.latestTransactions)
      };
    case getType(getPaymentsLatestReceiptAction.success):
      return {
        ...state,
        latestTransactions: pot.some(action.payload.data || []),
        latestTransactionsContinuationToken: action.payload.continuationToken
      };
    case getType(getPaymentsLatestReceiptAction.failure):
      return {
        ...state,
        latestTransactions: pot.toError(
          state.latestTransactions,
          action.payload
        )
      };
    case getType(getPaymentsLatestReceiptAction.cancel):
      return {
        ...state,
        latestTransactions: pot.none
      };
    // GET TRANSACTIONS LIST
    case getType(getPaymentsReceiptAction.request):
      const transactions = action.payload.firstLoad
        ? pot.noneLoading
        : pot.toLoading(state.transactions);
      return {
        ...state,
        transactions
      };
    case getType(getPaymentsReceiptAction.success):
      const previousTransactions = pot.getOrElse(state.transactions, []);
      const maybeTransactions = action.payload.data || [];
      return {
        ...state,
        transactions: !action.payload.appendElements
          ? pot.some([...previousTransactions, ...maybeTransactions])
          : pot.some(maybeTransactions),
        needsHomeListRefresh: false
      };
    case getType(getPaymentsReceiptAction.failure):
      return {
        ...state,
        transactions: pot.toError(state.transactions, action.payload)
      };
    case getType(getPaymentsReceiptAction.cancel):
      return {
        ...state,
        transactions: pot.none
      };
    // GET BIZ-EVENTS TRANSACTION DETAILS
    case getType(getPaymentsReceiptDetailsAction.request):
      return {
        ...state,
        details: pot.toLoading(state.details)
      };
    case getType(getPaymentsReceiptDetailsAction.success):
      return {
        ...state,
        details: pot.some(action.payload)
      };
    case getType(getPaymentsReceiptDetailsAction.failure):
      return {
        ...state,
        details: pot.toError(state.details, action.payload)
      };
    case getType(getPaymentsReceiptDetailsAction.cancel):
      return {
        ...state,
        details: pot.none
      };
    // GET BIZ-EVENTS TRANSACTION RECEIPT PDF
    case getType(getPaymentsReceiptDownloadAction.request):
      return {
        ...state,
        receiptDocument: pot.noneLoading
      };
    case getType(getPaymentsReceiptDownloadAction.success):
      return {
        ...state,
        receiptDocument: pot.some(action.payload)
      };
    case getType(getPaymentsReceiptDownloadAction.failure):
      return {
        ...state,
        receiptDocument: pot.toError(state.receiptDocument, action.payload)
      };
    case getType(getPaymentsReceiptDownloadAction.cancel):
      return {
        ...state,
        receiptDocument: pot.none
      };
    case getType(hidePaymentsReceiptAction.request): {
      const { filteredTransactions, removedIndices: transactionIndices } =
        filterTransactionsByIdAndGetIndex(
          state.transactions,
          action.payload.transactionId
        );

      const {
        filteredTransactions: filteredLatestTransactions,
        removedIndices: latestTransactionIndices
      } = filterTransactionsByIdAndGetIndex(
        state.latestTransactions,
        action.payload.transactionId
      );

      const hasTransactionRemovals = transactionIndices.length > 0;
      const cancelType: "transactions" | "latestTransactions" =
        hasTransactionRemovals ? "transactions" : "latestTransactions";
      const removedIndices = hasTransactionRemovals
        ? transactionIndices
        : latestTransactionIndices;
      const removedItems = hasTransactionRemovals
        ? removedIndices.map(
            index => pot.getOrElse(state.transactions, [])[index]
          )
        : removedIndices.map(
            index => pot.getOrElse(state.latestTransactions, [])[index]
          );

      return {
        ...state,
        cancelTransactionRecord: pot.some({
          removedItems,
          removedIndices,
          cancelType
        }),
        transactions: pot.some(filteredTransactions),
        latestTransactions: pot.some(filteredLatestTransactions)
      };
    }
    case getType(hidePaymentsReceiptAction.failure): {
      const restoreValue = pot.getOrElse(state.cancelTransactionRecord, null);
      if (!restoreValue) {
        return state;
      }

      const { cancelType, removedItems, removedIndices } = restoreValue;
      const currentTransactions = pot.getOrElse(state.transactions, []);
      const currentLatestTransactions = pot.getOrElse(
        state.latestTransactions,
        []
      );

      const restoredTransactions =
        cancelType === "transactions"
          ? restoreTransactionsToOriginalOrder(
              currentTransactions,
              removedIndices,
              removedItems
            )
          : currentTransactions;

      const restoredLatestTransactions =
        cancelType === "latestTransactions"
          ? restoreTransactionsToOriginalOrder(
              currentLatestTransactions,
              removedIndices,
              removedItems
            )
          : currentLatestTransactions;

      return {
        ...state,
        transactions: pot.some(restoredTransactions),
        latestTransactions: pot.some(restoredLatestTransactions),
        cancelTransactionRecord: pot.none
      };
    }
    case getType(setNeedsHomeListRefreshAction): {
      return {
        ...state,
        needsHomeListRefresh: action.payload
      };
    }
  }
  return state;
};

export default reducer;
