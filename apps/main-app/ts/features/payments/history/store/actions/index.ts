import { ActionType, createStandardAction } from "typesafe-actions";

import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { WalletPaymentOutcome } from "../../../checkout/types/PaymentOutcomeEnum";
import { PaymentAnalyticsBrowserType } from "../../../common/types/PaymentAnalytics";

export const storeNewPaymentAttemptAction = createStandardAction(
  "PAYMENTS_STORE_NEW_PAYMENT_ATTEMPT"
)<RptId>();

export const storePaymentOutcomeToHistory = createStandardAction(
  "PAYMENTS_STORE_OUTCOME_TO_HISTORY"
)<WalletPaymentOutcome>();

export const storePaymentsBrowserTypeAction = createStandardAction(
  "PAYMENTS_STORE_BROWSER_TYPE"
)<PaymentAnalyticsBrowserType>();

export const storePaymentIsOnboardedAction = createStandardAction(
  "PAYMENTS_STORE_IS_ONBOARDED"
)<boolean>();

export const removeExpiredPaymentsOngoingFailedAction = createStandardAction(
  "PAYMENTS_REMOVE_EXPIRED_ONGOING_FAILED"
)<ReadonlyArray<RptId>>();

export type PaymentsHistoryActions =
  | ActionType<typeof removeExpiredPaymentsOngoingFailedAction>
  | ActionType<typeof storeNewPaymentAttemptAction>
  | ActionType<typeof storePaymentIsOnboardedAction>
  | ActionType<typeof storePaymentOutcomeToHistory>
  | ActionType<typeof storePaymentsBrowserTypeAction>;
