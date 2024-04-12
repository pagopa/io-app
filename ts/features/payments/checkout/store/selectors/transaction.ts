import { createSelector } from "reselect";
import { selectPaymentsCheckoutState } from ".";

export const walletPaymentTransactionSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.transaction
);

export const walletPaymentAuthorizationUrlSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.authorizationUrl
);
