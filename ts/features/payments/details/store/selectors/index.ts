import { GlobalState } from "../../../../../store/reducers/types";

export const selectPaymentMethodDetails = (state: GlobalState) =>
  state.features.payments.details.walletDetails;
