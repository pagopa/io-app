import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletPaymentOutcome } from "../../../payment/types/PaymentOutcomeEnum";

export const walletPaymentHistoryStoreOutcome = createStandardAction(
  "WALLET_PAYMENT_HISTORY_STORE_OUTCOME"
)<WalletPaymentOutcome>();

export type WalletPaymentHistoryActions = ActionType<
  typeof walletPaymentHistoryStoreOutcome
>;
