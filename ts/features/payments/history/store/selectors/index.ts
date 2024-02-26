import { GlobalState } from "../../../../../store/reducers/types";

export const selectWalletPaymentHistoryArchive = (state: GlobalState) =>
  state.features.payments.history.archive;

export const selectWalletOngoingPaymentHistory = (state: GlobalState) =>
  state.features.payments.history.ongoingPayment;
