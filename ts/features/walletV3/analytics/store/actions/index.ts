import { ActionType, createStandardAction } from "typesafe-actions";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";

export const walletAnalyticsStorePaymentTentative = createStandardAction(
  "WALLET_ANALYTICS_STORE_PAYMENT_TENTATIVE"
)<RptId>();

export const walletAnalyticsResetPaymentTentative = createStandardAction(
  "WALLET_ANALYTICS_RESET_PAYMENT_TENTATIVE"
)<RptId>();

export type WalletAnalyticsActions =
  | ActionType<typeof walletAnalyticsStorePaymentTentative>
  | ActionType<typeof walletAnalyticsResetPaymentTentative>;
