import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletPaymentOutcome } from "../../../checkout/types/PaymentOutcomeEnum";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
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

export type PaymentsHistoryActions =
  | ActionType<typeof storeNewPaymentAttemptAction>
  | ActionType<typeof storePaymentOutcomeToHistory>
  | ActionType<typeof storePaymentsBrowserTypeAction>;
