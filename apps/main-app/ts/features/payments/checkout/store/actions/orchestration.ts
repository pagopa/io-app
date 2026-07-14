import { ActionType, createStandardAction } from "typesafe-actions";

import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentMethodResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { WalletInfo } from "../../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { PaymentStartOrigin, WalletPaymentStepEnum } from "../../types";
import { WalletPaymentOutcomeEnum } from "../../types/PaymentOutcomeEnum";

export const walletPaymentSetCurrentStep = createStandardAction(
  "WALLET_PAYMENT_SET_CURRENT_STEP"
)<WalletPaymentStepEnum>();

export type OnPaymentSuccessAction =
  | "showAarMessage"
  | "showHome"
  | "showTransaction";

export type PaymentInitStateParams = {
  onSuccess?: OnPaymentSuccessAction;
  serviceName?: string;
  startOrigin?: PaymentStartOrigin;
};

export type PaymentStartWebViewPayload = {
  onCancel?: (outcome?: WalletPaymentOutcomeEnum) => void;
  onError?: (outcome?: WalletPaymentOutcomeEnum) => void;
  onSuccess?: (url: string) => void;
  url: string;
};

type PaymentCompletedSuccessPayload = {
  kind: "COMPLETED" | "DUPLICATED";
  rptId: RptId;
};

/**
 * Action to initialize the state of a payment, optionally you can specify the
 * route to go back to after the payment is completed or cancelled (default is
 * the popToTop route)
 */
export const initPaymentStateAction = createStandardAction(
  "PAYMENTS_INIT_PAYMENT_STATE"
)<PaymentInitStateParams>();

export const selectPaymentMethodAction = createStandardAction(
  "PAYMENTS_SELECT_PAYMENT_METHOD"
)<{ paymentMethod?: PaymentMethodResponse; userWallet?: WalletInfo }>();

export const selectPaymentPspAction = createStandardAction(
  "PAYMENTS_SELECT_PAYMENT_PSP"
)<Bundle>();

export const paymentCompletedSuccess = createStandardAction(
  "PAYMENTS_PAYMENT_COMPLETED_SUCCESS"
)<PaymentCompletedSuccessPayload>();

export const paymentMethodPspBannerClose = createStandardAction(
  "PAYMENTS_PSP_BANNER_CLOSE"
)<string>();

export const paymentStartWebViewFlow = createStandardAction(
  "PAYMENTS_START_WEB_VIEW_FLOW"
)<PaymentStartWebViewPayload>();

export const paymentClearWebViewFlow = createStandardAction(
  "PAYMENTS_CLEAR_WEB_VIEW_FLOW"
)<void>();

export type PaymentsCheckoutOrchestrationActions =
  | ActionType<typeof initPaymentStateAction>
  | ActionType<typeof paymentClearWebViewFlow>
  | ActionType<typeof paymentCompletedSuccess>
  | ActionType<typeof paymentMethodPspBannerClose>
  | ActionType<typeof paymentStartWebViewFlow>
  | ActionType<typeof selectPaymentMethodAction>
  | ActionType<typeof selectPaymentPspAction>
  | ActionType<typeof walletPaymentSetCurrentStep>;
