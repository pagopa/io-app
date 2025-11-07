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

type TogglePnActivationRequestPaylad = {
  value: boolean;
  onSuccess?: () => void;
  onFailure?: (isRateLimitError?: boolean) => void;
};

type PNPaymentStatusTracking = {
  openingSource: SendOpeningSource;
  userType: SendUserType;
  messageId: string;
};

export const pnActivationUpsert = createAsyncAction(
  "PN_ACTIVATION_UPSERT_REQUEST",
  "PN_ACTIVATION_UPSERT_SUCCESS",
  "PN_ACTIVATION_UPSERT_FAILURE"
)<TogglePnActivationRequestPaylad, void, void>();

export const startPNPaymentStatusTracking = createStandardAction(
  "PN_START_TRACKING_PAYMENT_STATUS"
)<PNPaymentStatusTracking>();
export const cancelPNPaymentStatusTracking = createAction(
  "PN_CANCEL_PAYMENT_STATUS_TRACKING"
);
export const dismissPnActivationReminderBanner = createAction(
  "DISMISS_PN_ACTIVATION_REMINDER_BANNER"
);

export type PnActions =
  | ActionType<typeof pnActivationUpsert>
  | ActionType<typeof startPNPaymentStatusTracking>
  | ActionType<typeof cancelPNPaymentStatusTracking>
  | ActionType<typeof dismissPnActivationReminderBanner>;
