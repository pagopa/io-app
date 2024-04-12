import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";

const selectPaymentsCheckoutState = (state: GlobalState) =>
  state.features.payments.checkout;

export const selectWalletPaymentCurrentStep = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).currentStep;

export const selectWalletPaymentSessionTokenPot = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).sessionToken;

export const selectWalletPaymentSessionToken = (state: GlobalState) =>
  pot.toUndefined(selectWalletPaymentSessionTokenPot(state));

export const walletPaymentRptIdSelector = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).rptId;

export const walletPaymentDetailsSelector = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).paymentDetails;

export const walletPaymentAmountSelector = createSelector(
  walletPaymentDetailsSelector,
  state => pot.map(state, payment => payment.amount)
);

export const walletPaymentAllMethodsSelector = createSelector(
  selectPaymentsCheckoutState,
  state => pot.map(state.allPaymentMethods, _ => _.paymentMethods ?? [])
);

export const walletPaymentGenericMethodByIdSelector = createSelector(
  walletPaymentAllMethodsSelector,
  methodsPot => (id: string) =>
    pipe(
      methodsPot,
      pot.toOption,
      O.chainNullableK(methods => methods.find(_ => _.id === id))
    )
);

export const walletPaymentUserWalletsSelector = createSelector(
  selectPaymentsCheckoutState,
  state => pot.map(state.userWallets, _ => _.wallets ?? [])
);

export const walletPaymentSavedMethodByIdSelector = createSelector(
  walletPaymentUserWalletsSelector,
  methodsPot => (id: string) =>
    pipe(
      methodsPot,
      pot.toOption,
      O.chainNullableK(methods => methods.find(_ => _.walletId === id))
    )
);

export const walletPaymentPickedPaymentMethodSelector = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).chosenPaymentMethod;

export const walletPaymentPspListSelector = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).pspList;

export const walletPaymentPickedPspSelector = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).chosenPsp;

export const walletPaymentTransactionSelector = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).transaction;

export const walletPaymentAuthorizationUrlSelector = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).authorizationUrl;

export const walletPaymentOnSuccessActionSelector = (state: GlobalState) =>
  selectPaymentsCheckoutState(state).onSuccess;
