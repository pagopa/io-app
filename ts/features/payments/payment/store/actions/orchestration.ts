import { ActionType, createStandardAction } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { WalletInfo } from "../../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { PaymentStartOrigin, PaymentStartRoute } from "../../types";

export const walletPaymentSetCurrentStep = createStandardAction(
  "WALLET_PAYMENT_SET_CURRENT_STEP"
)<number>();

export type PaymentInitStateParams = {
  startOrigin?: PaymentStartOrigin;
  startRoute?: PaymentStartRoute;
  showTransaction?: boolean;
};

/**
 * Action to initialize the state of a payment, optionally you can specify the route to go back to
 * after the payment is completed or cancelled (default is the popToTop route)
 */
export const walletPaymentInitState = createStandardAction(
  "WALLET_PAYMENT_INIT_STATE"
)<PaymentInitStateParams>();

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
  | ActionType<typeof walletPaymentSetCurrentStep>
  | ActionType<typeof walletPaymentInitState>
  | ActionType<typeof walletPaymentPickPaymentMethod>
  | ActionType<typeof walletPaymentPickPsp>
  | ActionType<typeof walletPaymentResetPickedPsp>;
