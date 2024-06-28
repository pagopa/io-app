import { ActionType, createStandardAction } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentStartOrigin, WalletPaymentStepEnum } from "../../types";
import { WalletInfo } from "../../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { PaymentMethodResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";

export const walletPaymentSetCurrentStep = createStandardAction(
  "WALLET_PAYMENT_SET_CURRENT_STEP"
)<WalletPaymentStepEnum>();

export type OnPaymentSuccessAction = "showHome" | "showTransaction";

export type PaymentInitStateParams = {
  startOrigin?: PaymentStartOrigin;
  onSuccess?: OnPaymentSuccessAction;
};

export type PaymentCompletedSuccessPayload = {
  rptId: RptId;
  kind: "COMPLETED" | "DUPLICATED";
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
)<{ userWallet?: WalletInfo; paymentMethod?: PaymentMethodResponse }>();

export const selectPaymentPspAction = createStandardAction(
  "PAYMENTS_SELECT_PAYMENT_PSP"
)<Bundle>();

export const paymentCompletedSuccess = createStandardAction(
  "PAYMENTS_PAYMENT_COMPLETED_SUCCESS"
)<PaymentCompletedSuccessPayload>();

export type PaymentsCheckoutOrchestrationActions =
  | ActionType<typeof walletPaymentSetCurrentStep>
  | ActionType<typeof initPaymentStateAction>
  | ActionType<typeof selectPaymentMethodAction>
  | ActionType<typeof selectPaymentPspAction>
  | ActionType<typeof paymentCompletedSuccess>;
