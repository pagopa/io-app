import { ActionType, createStandardAction } from "typesafe-actions";

export const walletPaymentInitState = createStandardAction(
  "WALLET_PAYMENT_INIT_STATE"
)();

export const walletPaymentChoosePaymentMethod = createStandardAction(
  "WALLET_PAYMENT_CHOOSE_PAYMENT_METHOD"
)<{ walletId: string }>();

export const walletPaymentChoosePsp = createStandardAction(
  "WALLET_PAYMENT_CHOOSE_PSP"
)<{ bundleId: string }>();

export type WalletPaymentOrchestrationActions =
  | ActionType<typeof walletPaymentInitState>
  | ActionType<typeof walletPaymentChoosePaymentMethod>
  | ActionType<typeof walletPaymentChoosePsp>;
