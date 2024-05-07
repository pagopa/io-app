import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";

export const selectPaymentsCheckoutState = (state: GlobalState) =>
  state.features.payments.checkout;

export const selectWalletPaymentCurrentStep = createSelector(
  selectPaymentsCheckoutState,
  state => state.currentStep
);

export const selectWalletPaymentSessionTokenPot = createSelector(
  selectPaymentsCheckoutState,
  state => state.sessionToken
);

export const selectWalletPaymentSessionToken = createSelector(
  selectWalletPaymentSessionTokenPot,
  pot.toUndefined
);

export const walletPaymentRptIdSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.rptId
);

export const walletPaymentDetailsSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.paymentDetails
);

export const walletPaymentAmountSelector = createSelector(
  walletPaymentDetailsSelector,
  state => pot.map(state, payment => payment.amount)
);

export const walletPaymentOnSuccessActionSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.onSuccess
);
