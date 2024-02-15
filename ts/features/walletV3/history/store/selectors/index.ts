import { GlobalState } from "../../../../../store/reducers/types";

export const selectWalletPaymentHistoryArchive = (state: GlobalState) =>
  state.features.wallet.history.archive;

export const selectWalletOngoingPaymentHistory = (state: GlobalState) =>
  state.features.wallet.history.ongoingPayment;
