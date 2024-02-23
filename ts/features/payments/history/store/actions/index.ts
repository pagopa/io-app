import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletPaymentOutcome } from "../../../payment/types/PaymentOutcomeEnum";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";

export const walletPaymentStoreNewAttempt = createStandardAction(
  "WALLET_PAYMENT_STORE_NEW_ATTEMPT"
)<RptId>();

export const walletPaymentHistoryStoreOutcome = createStandardAction(
  "WALLET_PAYMENT_HISTORY_STORE_OUTCOME"
)<WalletPaymentOutcome>();

export type WalletPaymentHistoryActions =
  | ActionType<typeof walletPaymentStoreNewAttempt>
  | ActionType<typeof walletPaymentHistoryStoreOutcome>;
