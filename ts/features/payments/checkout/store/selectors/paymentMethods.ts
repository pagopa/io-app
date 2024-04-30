import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { selectPaymentsCheckoutState } from ".";

export const walletPaymentUserWalletsSelector = createSelector(
  selectPaymentsCheckoutState,
  state => pot.map(state.userWallets, _ => _.wallets ?? [])
);

export const walletPaymentAllMethodsSelector = createSelector(
  selectPaymentsCheckoutState,
  state => pot.map(state.allPaymentMethods, _ => _.paymentMethods ?? [])
);

export const walletPaymentMethodByIdSelector = createSelector(
  walletPaymentAllMethodsSelector,
  methodsPot => (id: string) =>
    pipe(
      methodsPot,
      pot.toOption,
      O.chainNullableK(methods => methods.find(_ => _.id === id))
    )
);

export const walletPaymentUserWalletByIdSelector = createSelector(
  walletPaymentUserWalletsSelector,
  methodsPot => (id: string) =>
    pipe(
      methodsPot,
      pot.toOption,
      O.chainNullableK(methods => methods.find(_ => _.walletId === id))
    )
);

export const walletPaymentSelectedWalletOptionSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.selectedWallet
);

export const walletPaymentSelectedPaymentMethodOptionSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.selectedPaymentMethod
);

export const walletPaymentSelectedPaymentMethodIdOptionSelector =
  createSelector(
    walletPaymentSelectedWalletOptionSelector,
    walletPaymentSelectedPaymentMethodOptionSelector,
    (selectedWalletOption, selectedPaymentMethodOption) =>
      pipe(
        selectedWalletOption,
        O.map(({ paymentMethodId }) => paymentMethodId),
        O.alt(() =>
          pipe(
            selectedPaymentMethodOption,
            O.map(({ id }) => id)
          )
        )
      )
  );

export const walletPaymentSelectedWalletIdOptionSelector = createSelector(
  walletPaymentSelectedWalletOptionSelector,
  selectedWalletOption =>
    pipe(
      selectedWalletOption,
      O.map(({ walletId }) => walletId)
    )
);
