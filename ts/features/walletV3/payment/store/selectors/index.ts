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
