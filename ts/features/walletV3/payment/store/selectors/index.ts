import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";

const selectWalletPayment = (state: GlobalState) =>
  state.features.wallet.payment;

export const walletPaymentDetailsSelector = createSelector(
  selectWalletPayment,
  state => state.paymentDetails
);

export const walletPaymentAllMethodsSelector = createSelector(
  selectWalletPayment,
  state => state.allPaymentMethods
);

export const walletPaymentUserMethodsSelector = createSelector(
  selectWalletPayment,
  state => state.userWallets
);

export const walletPaymentChosenPaymentMethodSelector = createSelector(
  selectWalletPayment,
  state => state.chosenPaymentMethod
);

export const walletPaymentPspListSelector = createSelector(
  selectWalletPayment,
  state => state.pspList
);

export const walletPaymentChosenPspSelector = createSelector(
  selectWalletPayment,
  state => state.chosenPsp
);

export const walletPaymentTransactionSelector = createSelector(
  selectWalletPayment,
  state => state.transaction
);
