import { createSelector } from "reselect";
import { selectPaymentsCheckoutState } from ".";

export const walletPaymentPspListSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.pspList
);

export const walletPaymentSelectedPspSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.selectedPsp
);
