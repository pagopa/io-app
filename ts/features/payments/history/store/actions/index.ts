import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletPaymentOutcome } from "../../../checkout/types/PaymentOutcomeEnum";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";

export const storeNewPaymentAttemptAction = createStandardAction(
  "PAYMENTS_STORE_NEW_PAYMENT_ATTEMPT"
)<RptId>();

export const storePaymentOutcomeToHistory = createStandardAction(
  "PAYMENTS_STORE_OUTCMOE_TO_HISTORY"
)<WalletPaymentOutcome>();

export type PaymentsHistoryActions =
  | ActionType<typeof storeNewPaymentAttemptAction>
  | ActionType<typeof storePaymentOutcomeToHistory>;
