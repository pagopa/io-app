import { GlobalState } from "../../../../../store/reducers/types";

const walletTransactionSelector = (state: GlobalState) =>
  state.features.payments.transaction;

export const walletTransactionDetailsPotSelector = (state: GlobalState) =>
  walletTransactionSelector(state).details;
