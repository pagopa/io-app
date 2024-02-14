import { GlobalState } from "../../../../../store/reducers/types";

const selectWalletPaymentHistory = (state: GlobalState) =>
  state.features.wallet.history;

export const selectWalletActivePaymentHistory = (state: GlobalState) =>
  selectWalletPaymentHistory(state).activePaymentHistory;
