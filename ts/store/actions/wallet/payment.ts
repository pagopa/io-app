import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  PAYMENT_COMPLETED,
  PAYMENT_CONFIRM_PAYMENT_METHOD,
  PAYMENT_MANUAL_ENTRY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_QR_CODE,
  PAYMENT_REQUEST_COMPLETION,
  PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
  PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
  PAYMENT_REQUEST_MANUAL_ENTRY,
  PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
  PAYMENT_REQUEST_QR_CODE,
  PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  PAYMENT_TRANSACTION_SUMMARY
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

export type PaymentRequestTransactionSummary = Readonly<{
  type: typeof PAYMENT_REQUEST_TRANSACTION_SUMMARY;
  payload: {
    rptId: RptId;
    initialAmount: AmountInEuroCents;
  };
}>;

export type PaymentTransactionSummary = Readonly<{
  type: typeof PAYMENT_TRANSACTION_SUMMARY;
  payload: {
    rptId: RptId;
    verificaResponse: PaymentRequestsGetResponse;
    initialAmount: AmountInEuroCents;
  };
}>;

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

/**
 * All possible payment actions
 */
export type PaymentActions =
  | PaymentRequestQrCode
  | PaymentQrCode
  | PaymentRequestManualEntry
  | PaymentManualEntry
  | PaymentRequestTransactionSummary
  | PaymentTransactionSummary
  | PaymentRequestContinueWithPaymentMethods
  | PaymentRequestPickPaymentMethod
  | PaymentPickPaymentMethod
  | PaymentRequestConfirmPaymentMethod
  | PaymentConfirmPaymentMethod
  | PaymentRequestCompletion
  | PaymentCompleted;

export const paymentRequestQrCode = (): PaymentRequestQrCode => ({
  type: PAYMENT_REQUEST_QR_CODE
});

export const paymentQrCode = (): PaymentQrCode => ({
  type: PAYMENT_QR_CODE
});

export const paymentRequestManualEntry = (): PaymentRequestManualEntry => ({
  type: PAYMENT_REQUEST_MANUAL_ENTRY
});

export const paymentManualEntry = (): PaymentManualEntry => ({
  type: PAYMENT_MANUAL_ENTRY
});

export const paymentRequestTransactionSummary = (
  rptId: RptId,
  initialAmount: AmountInEuroCents
): PaymentRequestTransactionSummary => ({
  type: PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  payload: { rptId, initialAmount }
});

export const paymentTransactionSummary = (
  rptId: RptId,
  initialAmount: AmountInEuroCents,
  verificaResponse: PaymentRequestsGetResponse
): PaymentTransactionSummary => ({
  type: PAYMENT_TRANSACTION_SUMMARY,
  payload: { rptId, verificaResponse, initialAmount }
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
