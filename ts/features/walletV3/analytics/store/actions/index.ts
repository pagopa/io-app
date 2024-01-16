import { ActionType, createStandardAction } from "typesafe-actions";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";

export const walletAnalyticsStorePaymentAttempt = createStandardAction(
  "WALLET_ANALYTICS_STORE_PAYMENT_ATTEMPT"
)<RptId>();

export const walletAnalyticsResetPaymentAttempt = createStandardAction(
  "WALLET_ANALYTICS_RESET_PAYMENT_ATTEMPT"
)<RptId>();

export type WalletAnalyticsActions =
  | ActionType<typeof walletAnalyticsStorePaymentAttempt>
  | ActionType<typeof walletAnalyticsResetPaymentAttempt>;
