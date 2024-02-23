import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";

const selectWalletPayment = (state: GlobalState) =>
  state.features.payments.payment;

export const selectWalletPaymentSessionTokenPot = (state: GlobalState) =>
  selectWalletPayment(state).sessionToken;

export const selectWalletPaymentSessionToken = (state: GlobalState) =>
  pot.toUndefined(selectWalletPaymentSessionTokenPot(state));

export const walletPaymentRptIdSelector = (state: GlobalState) =>
  selectWalletPayment(state).rptId;

export const walletPaymentDetailsSelector = (state: GlobalState) =>
  selectWalletPayment(state).paymentDetails;

export const walletPaymentAmountSelector = createSelector(
  walletPaymentDetailsSelector,
  state => pot.map(state, payment => payment.amount)
);

export const walletPaymentAllMethodsSelector = createSelector(
  selectWalletPayment,
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
  selectWalletPayment,
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
  selectWalletPayment(state).chosenPaymentMethod;

export const walletPaymentPspListSelector = (state: GlobalState) =>
  selectWalletPayment(state).pspList;

export const walletPaymentPickedPspSelector = (state: GlobalState) =>
  selectWalletPayment(state).chosenPsp;

export const walletPaymentTransactionSelector = (state: GlobalState) =>
  selectWalletPayment(state).transaction;

export const walletPaymentAuthorizationUrlSelector = (state: GlobalState) =>
  selectWalletPayment(state).authorizationUrl;

export const walletPaymentStartRouteSelector = (state: GlobalState) =>
  selectWalletPayment(state).startRoute;
