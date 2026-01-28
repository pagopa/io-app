import { GlobalState } from "../../../../../store/reducers/types";

const walletReceiptSelector = (state: GlobalState) =>
  state.features.payments.receipt;

export const walletReceiptDetailsPotSelector = (state: GlobalState) =>
  walletReceiptSelector(state).details;

export const walletReceiptListPotSelector = (state: GlobalState) =>
  walletReceiptSelector(state).transactions;

export const walletLatestReceiptListPotSelector = (state: GlobalState) =>
  walletReceiptSelector(state).latestTransactions;

export const walletReceiptPotSelector = (state: GlobalState) =>
  walletReceiptSelector(state).receiptDocument;

export const needsHomeListRefreshSelector = (state: GlobalState) =>
  walletReceiptSelector(state).needsHomeListRefresh;
