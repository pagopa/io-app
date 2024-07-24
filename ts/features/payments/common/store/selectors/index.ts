import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { paymentsWalletUserMethodsFromPotSelector } from "../../../wallet/store/selectors";
import { PaymentsTrackingConfiguration } from "../../analytics";

export const selectPaymentsCheckoutState = (state: GlobalState) =>
  state.features.payments.pagoPaPlatform;

export const selectPagoPaPlatformSessionTokenPot = createSelector(
  selectPaymentsCheckoutState,
  state => state.sessionToken
);

export const selectPagoPaPlatformSessionToken = createSelector(
  selectPagoPaPlatformSessionTokenPot,
  pot.toUndefined
);

export const getPaymentsAnalyticsConfiguration = (
  state: GlobalState
): PaymentsTrackingConfiguration => {
  const savedPaymentMethods =
    paymentsWalletUserMethodsFromPotSelector(state).length;
  return {
    savedPaymentMethods
  };
};
