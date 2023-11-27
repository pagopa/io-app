import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";

export const walletPaymentInitState = createStandardAction(
  "WALLET_PAYMENT_INIT_STATE"
)();

export const walletPaymentChoosePaymentMethod = createStandardAction(
  "WALLET_PAYMENT_CHOOSE_PAYMENT_METHOD"
)<WalletInfo>();

export const walletPaymentChoosePsp = createStandardAction(
  "WALLET_PAYMENT_CHOOSE_PSP"
)<Bundle>();

export type WalletPaymentOrchestrationActions =
  | ActionType<typeof walletPaymentInitState>
  | ActionType<typeof walletPaymentChoosePaymentMethod>
  | ActionType<typeof walletPaymentChoosePsp>;
