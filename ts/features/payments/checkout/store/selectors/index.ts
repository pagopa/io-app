import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";

export const selectPaymentsCheckoutState = (state: GlobalState) =>
  state.features.payments.checkout;

export const selectWalletPaymentCurrentStep = createSelector(
  selectPaymentsCheckoutState,
  state => state.currentStep
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

export const walletPaymentWebViewPayloadSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.webViewPayload
);
