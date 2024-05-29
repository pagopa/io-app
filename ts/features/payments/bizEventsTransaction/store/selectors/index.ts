import { GlobalState } from "../../../../../store/reducers/types";

const walletTransactionBizEventsSelector = (state: GlobalState) =>
  state.features.payments.bizEventsTransaction;

export const walletTransactionBizEventsDetailsPotSelector = (
  state: GlobalState
) => walletTransactionBizEventsSelector(state).details;

export const walletTransactionBizEventsBizEventsDetailsPotSelector = (
  state: GlobalState
) => walletTransactionBizEventsSelector(state).details;

export const walletTransactionBizEventsListPotSelector = (state: GlobalState) =>
  walletTransactionBizEventsSelector(state).transactions;

export const walletLatestTransactionsBizEventsListPotSelector = (
  state: GlobalState
) => walletTransactionBizEventsSelector(state).latestTransactions;
