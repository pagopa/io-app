import { createSelector } from "reselect";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";

const selectWalletPayment = (state: GlobalState) =>
  state.features.wallet.payment;

export const walletPaymentRptIdSelector = createSelector(
  selectWalletPayment,
  state => state.rptId
);

export const walletPaymentDetailsSelector = createSelector(
  selectWalletPayment,
  state => state.paymentDetails
);

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
  state => (id: string) =>
    pot.map(state, methods => methods.find(_ => _.id === id))
);

export const walletPaymentUserWalletsSelector = createSelector(
  selectWalletPayment,
  state => pot.map(state.userWallets, _ => _.wallets ?? [])
);

export const walletPaymentSavedMethodByIdSelector = createSelector(
  walletPaymentUserWalletsSelector,
  state => (id: string) =>
    pot.map(state, methods => methods.find(_ => _.walletId === id))
);

export const walletPaymentPickedPaymentMethodSelector = createSelector(
  selectWalletPayment,
  state => state.chosenPaymentMethod
);

export const walletPaymentPspListSelector = createSelector(
  selectWalletPayment,
  state => state.pspList
);

export const walletPaymentPickedPspSelector = createSelector(
  selectWalletPayment,
  state => state.chosenPsp
);

export const walletPaymentTransactionSelector = createSelector(
  selectWalletPayment,
  state => state.transaction
);

export const walletPaymentAuthorizationUrlSelector = createSelector(
  selectWalletPayment,
  state => state.authorizationUrl
);
