import { ActionType, createStandardAction } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { WalletInfo } from "../../../../../../definitions/pagopa/ecommerce/WalletInfo";
import {
  PaymentStartOrigin,
  PaymentStartRoute,
  WalletPaymentStepEnum
} from "../../types";

export const walletPaymentSetCurrentStep = createStandardAction(
  "WALLET_PAYMENT_SET_CURRENT_STEP"
)<WalletPaymentStepEnum>();

export type PaymentInitStateParams = {
  startOrigin?: PaymentStartOrigin;
  startRoute?: PaymentStartRoute;
  showTransaction?: boolean;
};

/**
 * Action to initialize the state of a payment, optionally you can specify the route to go back to
 * after the payment is completed or cancelled (default is the popToTop route)
 */
export const initPaymentStateAction = createStandardAction(
  "PAYMENTS_INIT_PAYMENT_STATE"
)<PaymentInitStateParams>();

export const selectPaymentMethodAction = createStandardAction(
  "PAYMENTS_SELECT_PAYMENT_METHOD"
)<WalletInfo>();

export const selectPaymentPspAction = createStandardAction(
  "PAYMENTS_SELECT_PAYMENT_PSP"
)<Bundle>();

export const resetPaymentPspAction = createStandardAction(
  "PAYMENTS_RESET_PAYMENT_PSP"
)();

export type PaymentsCheckoutOrchestrationActions =
  | ActionType<typeof walletPaymentSetCurrentStep>
  | ActionType<typeof initPaymentStateAction>
  | ActionType<typeof selectPaymentMethodAction>
  | ActionType<typeof selectPaymentPspAction>
  | ActionType<typeof resetPaymentPspAction>;
