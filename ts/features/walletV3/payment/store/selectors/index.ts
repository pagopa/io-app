import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { Transfer } from "../../../../../../definitions/pagopa/ecommerce/Transfer";

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

export const walletPaymentTransactionTransferListSelector = createSelector(
  walletPaymentTransactionSelector,
  transaction =>
    pot.map(transaction, t =>
      t.payments.reduce(
        (a, p) => [...a, ...(p.transferList ?? [])],
        [] as ReadonlyArray<Transfer>
      )
    )
);

export const walletPaymentAuthorizationUrlSelector = createSelector(
  selectWalletPayment,
  state => state.authorizationUrl
);

export const walletPaymentStartRouteSelector = createSelector(
  selectWalletPayment,
  state => state.startRoute
);
