import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { PaymentsMethodDetailsActions } from "../../../details/store/actions";
import { PaymentsHistoryActions } from "../../../history/store/actions";
import { PaymentsOnboardingActions } from "../../../onboarding/store/actions";
import { PaymentsCheckoutActions } from "../../../checkout/store/actions";
import { PaymentsHomeActions } from "../../../home/store/actions";
import { PaymentsWalletActions } from "../../../wallet/store/actions";
import { PaymentsReceiptActions } from "../../../receipts/store/actions";

import { NetworkError } from "../../../../../utils/errors";
import { SessionTokenResponse } from "../../../../../../definitions/pagopa/platform/SessionTokenResponse";
import { Action } from "../../../../../store/actions/types";
import { PaymentsBackoffRetry } from "../../types/PaymentsBackoffRetry";

export const paymentsGetPagoPaPlatformSessionTokenAction = createAsyncAction(
  "PAYMENTS_GET_NEW_SESSION_TOKEN_REQUEST",
  "PAYMENTS_GET_NEW_SESSION_TOKEN_SUCCESS",
  "PAYMENTS_GET_NEW_SESSION_TOKEN_FAILURE"
)<undefined, SessionTokenResponse, NetworkError>();

export const paymentsResetPagoPaPlatformSessionTokenAction =
  createStandardAction("PAYMENTS_RESET_SESSION_TOKEN")<undefined>();

type PaymentsPendingActionPayload = { pendingAction: Action };
export const savePaymentsPendingAction = createStandardAction(
  "SAVE_PAYMENTS_PENDING_ACTION"
)<PaymentsPendingActionPayload>();

export const clearPaymentsPendingActions = createStandardAction(
  "CLEAR_PAYMENTS_PENDING_ACTIONS"
)<void>();

export const increasePaymentsBackoffRetry = createStandardAction(
  "INCREASE_PAYMENTS_BACKOFF_RETRY"
)<PaymentsBackoffRetry>();

export const clearPaymentsBackoffRetry = createStandardAction(
  "CLEAR_PAYMENTS_BACKOFF_RETRY"
)<PaymentsBackoffRetry>();

export type PaymentsActions =
  | ActionType<typeof paymentsResetPagoPaPlatformSessionTokenAction>
  | ActionType<typeof paymentsGetPagoPaPlatformSessionTokenAction>
  | ActionType<typeof savePaymentsPendingAction>
  | ActionType<typeof clearPaymentsPendingActions>
  | ActionType<typeof increasePaymentsBackoffRetry>
  | ActionType<typeof clearPaymentsBackoffRetry>
  | PaymentsOnboardingActions
  | PaymentsMethodDetailsActions
  | PaymentsCheckoutActions
  | PaymentsHistoryActions
  | PaymentsHomeActions
  | PaymentsWalletActions
  | PaymentsReceiptActions;
