import { ActionType, createStandardAction } from "typesafe-actions";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";

export const walletPaymentInitState = createStandardAction(
  "WALLET_PAYMENT_INIT_STATE"
)();

export const walletPaymentPickPaymentMethod = createStandardAction(
  "WALLET_PAYMENT_PICK_PAYMENT_METHOD"
)<WalletInfo>();

export const walletPaymentPickPsp = createStandardAction(
  "WALLET_PAYMENT_PICK_PSP"
)<Bundle>();

export const walletPaymentResetPickedPsp = createStandardAction(
  "WALLET_PAYMENT_RESET_PICKED_PSP"
)();

export type WalletPaymentOrchestrationActions =
  | ActionType<typeof walletPaymentInitState>
  | ActionType<typeof walletPaymentPickPaymentMethod>
  | ActionType<typeof walletPaymentPickPsp>
  | ActionType<typeof walletPaymentResetPickedPsp>;
