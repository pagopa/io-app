import { GlobalState } from "../../../../../store/reducers/types";

const walletNoticeSelector = (state: GlobalState) =>
  state.features.payments.notice;

export const walletNoticeDetailsPotSelector = (state: GlobalState) =>
  walletNoticeSelector(state).details;

export const walletNoticeListPotSelector = (state: GlobalState) =>
  walletNoticeSelector(state).transactions;

export const walletLatestNoticeListPotSelector = (state: GlobalState) =>
  walletNoticeSelector(state).latestTransactions;

export const walletNoticeReceiptPotSelector = (state: GlobalState) =>
  walletNoticeSelector(state).receiptDocument;
