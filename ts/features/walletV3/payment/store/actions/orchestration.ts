import { ActionType, createStandardAction } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { AppParamsList } from "../../../../../navigation/params/AppParamsList";

/**
 * Action to initialize the state of a payment, optionally you can specify the route to go back to
 * after the payment is completed or cancelled (default is the popToTop route)
 */
export const walletPaymentInitState = createStandardAction(
  "WALLET_PAYMENT_INIT_STATE"
)<keyof AppParamsList | undefined>();

export const walletPaymentPickPaymentMethod = createStandardAction(
  "WALLET_PAYMENT_PICK_PAYMENT_METHOD"
)<WalletInfo>();

export const walletPaymentPickPsp = createStandardAction(
  "WALLET_PAYMENT_PICK_PSP"
)<Bundle>();

export const walletPaymentResetPickedPsp = createStandardAction(
  "WALLET_PAYMENT_RESET_PICKED_PSP"
)();

export const walletPaymentBackState = createStandardAction(
  "WALLET_PAYMENT_BACK_STATE"
)();

export type WalletPaymentOrchestrationActions =
  | ActionType<typeof walletPaymentInitState>
  | ActionType<typeof walletPaymentPickPaymentMethod>
  | ActionType<typeof walletPaymentPickPsp>
  | ActionType<typeof walletPaymentResetPickedPsp>
  | ActionType<typeof walletPaymentBackState>;
