import {
  ActionType,
  createAction,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";

type CancelPnPaymentStatusTracking = {
  messageId: string;
};

type PNPaymentStatusTracking = {
  messageId: string;
  openingSource: SendOpeningSource;
  userType: SendUserType;
};
type TogglePnActivationRequestPaylad = {
  onFailure?: (isRateLimitError?: boolean) => void;
  onSuccess?: () => void;
  value: boolean;
};

export const pnActivationUpsert = createAsyncAction(
  "PN_ACTIVATION_UPSERT_REQUEST",
  "PN_ACTIVATION_UPSERT_SUCCESS",
  "PN_ACTIVATION_UPSERT_FAILURE"
)<TogglePnActivationRequestPaylad, void, void>();

export const startPNPaymentStatusTracking = createStandardAction(
  "PN_START_TRACKING_PAYMENT_STATUS"
)<PNPaymentStatusTracking>();
export const cancelPNPaymentStatusTracking = createStandardAction(
  "PN_CANCEL_PAYMENT_STATUS_TRACKING"
)<CancelPnPaymentStatusTracking>();
export const dismissPnActivationReminderBanner = createAction(
  "DISMISS_PN_ACTIVATION_REMINDER_BANNER"
);

export type PnActions =
  | ActionType<typeof cancelPNPaymentStatusTracking>
  | ActionType<typeof dismissPnActivationReminderBanner>
  | ActionType<typeof pnActivationUpsert>
  | ActionType<typeof startPNPaymentStatusTracking>;
