import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  PAYMENT_COMPLETED,
  PAYMENT_CONFIRM_PAYMENT_METHOD,
  PAYMENT_GO_BACK,
  PAYMENT_MANUAL_ENTRY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_QR_CODE,
  PAYMENT_REQUEST_COMPLETION,
  PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
  PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
  PAYMENT_REQUEST_GO_BACK,
  PAYMENT_REQUEST_MANUAL_ENTRY,
  PAYMENT_REQUEST_MESSAGE,
  PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
  PAYMENT_REQUEST_QR_CODE,
  PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER,
  PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID
} from "../constants";

export type PaymentRequestQrCode = Readonly<{
  type: typeof PAYMENT_REQUEST_QR_CODE;
}>;

export type PaymentQrCode = Readonly<{
  type: typeof PAYMENT_QR_CODE;
}>;

export type PaymentRequestManualEntry = Readonly<{
  type: typeof PAYMENT_REQUEST_MANUAL_ENTRY;
}>;

export type PaymentManualEntry = Readonly<{
  type: typeof PAYMENT_MANUAL_ENTRY;
}>;

export type PaymentRequestMessage = Readonly<{
  type: typeof PAYMENT_REQUEST_MESSAGE;
}>;

// for the first time the screen is being shown (i.e. after the
// rptId has been passed (from qr code/manual entry/message)
export type PaymentRequestTransactionSummaryFromRptId = Readonly<{
  type: typeof PAYMENT_REQUEST_TRANSACTION_SUMMARY;
  kind: "fromRptId";
  payload: {
    rptId: RptId;
    initialAmount: AmountInEuroCents;
  };
}>;

// for when the user taps on the payment banner and gets redirected
// to the summary of the payment
export type PaymentRequestTransactionSummaryFromBanner = Readonly<{
  type: typeof PAYMENT_REQUEST_TRANSACTION_SUMMARY;
  kind: "fromBanner";
}>;

export type PaymentRequestTransactionSummaryActions =
  | PaymentRequestTransactionSummaryFromRptId
  | PaymentRequestTransactionSummaryFromBanner;

export type PaymentTransactionSummaryFromRptId = Readonly<{
  type: typeof PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID;
  payload: {
    rptId: RptId;
    verificaResponse: PaymentRequestsGetResponse;
    initialAmount: AmountInEuroCents;
  };
}>;

export type PaymentTransactionSummaryFromBanner = Readonly<{
  type: typeof PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER;
}>;

export type PaymentTransactionSummaryActions =
  | PaymentTransactionSummaryFromRptId
  | PaymentTransactionSummaryFromBanner;

export type PaymentRequestContinueWithPaymentMethods = Readonly<{
  type: typeof PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS;
}>;

export type PaymentRequestPickPaymentMethod = Readonly<{
  type: typeof PAYMENT_REQUEST_PICK_PAYMENT_METHOD;
}>;

export type PaymentPickPaymentMethod = Readonly<{
  type: typeof PAYMENT_PICK_PAYMENT_METHOD;
}>;

export type PaymentRequestConfirmPaymentMethod = Readonly<{
  type: typeof PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD;
  payload: number; // selected card id
}>;

export type PaymentConfirmPaymentMethod = Readonly<{
  type: typeof PAYMENT_CONFIRM_PAYMENT_METHOD;
  payload: number; // selected card id
}>;

export type PaymentRequestCompletion = Readonly<{
  type: typeof PAYMENT_REQUEST_COMPLETION;
}>;

export type PaymentCompleted = Readonly<{
  type: typeof PAYMENT_COMPLETED;
}>;

export type PaymentGoBack = Readonly<{
  type: typeof PAYMENT_GO_BACK;
}>;

export type PaymentRequestGoBack = Readonly<{
  type: typeof PAYMENT_REQUEST_GO_BACK;
}>;

/**
 * All possible payment actions
 */
export type PaymentActions =
  | PaymentRequestQrCode
  | PaymentQrCode
  | PaymentRequestManualEntry
  | PaymentRequestMessage
  | PaymentManualEntry
  | PaymentRequestTransactionSummaryActions
  | PaymentTransactionSummaryActions
  | PaymentRequestContinueWithPaymentMethods
  | PaymentRequestPickPaymentMethod
  | PaymentPickPaymentMethod
  | PaymentRequestConfirmPaymentMethod
  | PaymentConfirmPaymentMethod
  | PaymentRequestCompletion
  | PaymentCompleted
  | PaymentGoBack
  | PaymentRequestGoBack;

export const paymentRequestQrCode = (): PaymentRequestQrCode => ({
  type: PAYMENT_REQUEST_QR_CODE
});

export const paymentQrCode = (): PaymentQrCode => ({
  type: PAYMENT_QR_CODE
});

export const paymentRequestManualEntry = (): PaymentRequestManualEntry => ({
  type: PAYMENT_REQUEST_MANUAL_ENTRY
});

export const paymentRequestMessage = (): PaymentRequestMessage => ({
  type: PAYMENT_REQUEST_MESSAGE
});

export const paymentManualEntry = (): PaymentManualEntry => ({
  type: PAYMENT_MANUAL_ENTRY
});

export const paymentRequestTransactionSummaryFromRptId = (
  rptId: RptId,
  initialAmount: AmountInEuroCents
): PaymentRequestTransactionSummaryFromRptId => ({
  type: PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  kind: "fromRptId",
  payload: { rptId, initialAmount }
});

export const paymentRequestTransactionSummaryFromBanner = (): PaymentRequestTransactionSummaryFromBanner => ({
  type: PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  kind: "fromBanner"
});

export const paymentTransactionSummaryFromRptId = (
  rptId: RptId,
  initialAmount: AmountInEuroCents,
  verificaResponse: PaymentRequestsGetResponse
): PaymentTransactionSummaryFromRptId => ({
  type: PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID,
  payload: { rptId, verificaResponse, initialAmount }
});

export const paymentTransactionSummaryFromBanner = (): PaymentTransactionSummaryFromBanner => ({
  type: PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER
});

export const paymentRequestContinueWithPaymentMethods = (): PaymentRequestContinueWithPaymentMethods => ({
  type: PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS
});

export const paymentRequestPickPaymentMethod = (): PaymentRequestPickPaymentMethod => ({
  type: PAYMENT_REQUEST_PICK_PAYMENT_METHOD
});

export const paymentPickPaymentMethod = (): PaymentPickPaymentMethod => ({
  type: PAYMENT_PICK_PAYMENT_METHOD
});

export const paymentRequestConfirmPaymentMethod = (
  walletId: number
): PaymentRequestConfirmPaymentMethod => ({
  type: PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
  payload: walletId
});

export const paymentConfirmPaymentMethod = (
  walletId: number
): PaymentConfirmPaymentMethod => ({
  type: PAYMENT_CONFIRM_PAYMENT_METHOD,
  payload: walletId
});

export const paymentRequestCompletion = (): PaymentRequestCompletion => ({
  type: PAYMENT_REQUEST_COMPLETION
});

export const paymentCompleted = (): PaymentCompleted => ({
  type: PAYMENT_COMPLETED
});

export const paymentGoBack = (): PaymentGoBack => ({
  type: PAYMENT_GO_BACK
});

export const paymentRequestGoBack = (): PaymentRequestGoBack => ({
  type: PAYMENT_REQUEST_GO_BACK
});
