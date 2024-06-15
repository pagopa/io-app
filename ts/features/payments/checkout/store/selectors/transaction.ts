import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { TransactionStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/TransactionStatus";
import { selectPaymentsCheckoutState } from ".";

export const walletPaymentTransactionSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.transaction
);

export const walletPaymentIsTransactionActivatedSelector = createSelector(
  selectPaymentsCheckoutState,
  state =>
    pipe(
      state.transaction,
      pot.toOption,
      O.map(t => t.status === TransactionStatusEnum.ACTIVATED),
      O.getOrElse(() => false)
    )
);

export const walletPaymentAuthorizationUrlSelector = createSelector(
  selectPaymentsCheckoutState,
  state => state.authorizationUrl
);
