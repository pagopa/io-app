import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { PaymentsBackoffRetry } from "../../types/PaymentsBackoffRetry";

export const selectPaymentsCheckoutState = (state: GlobalState) =>
  state.features.payments.pagoPaPlatform;

export const selectPagoPaPlatformSessionTokenPot = createSelector(
  selectPaymentsCheckoutState,
  state => state.sessionToken
);

export const selectPagoPaPlatformPendingActions = createSelector(
  selectPaymentsCheckoutState,
  state => state.pendingActions
);

export const selectPagoPaPlatformSessionToken = createSelector(
  selectPagoPaPlatformSessionTokenPot,
  pot.toUndefined
);

export const selectPaymentsBackoffRetryState = (state: GlobalState) =>
  state.features.payments.paymentsBackoffRetry;

export const paymentsBackoffRetrySelector = (id: PaymentsBackoffRetry) =>
  createSelector(selectPaymentsBackoffRetryState, state => state[id]);
