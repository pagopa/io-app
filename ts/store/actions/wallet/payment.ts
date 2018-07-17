import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import {
  PAYMENT_CONFIRM_PAYMENT_METHOD,
  PAYMENT_CONFIRM_SUMMARY,
  PAYMENT_INSERT_DATA_MANUALLY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_REQUEST_OTP,
  PAYMENT_SHOW_SUMMARY,
  PAYMENT_START,
  PAYMENT_STORE_INITIAL_AMOUNT,
  PAYMENT_STORE_RPTID_DATA,
  PAYMENT_STORE_SELECTED_PAYMENT_METHOD,
  PAYMENT_STORE_VERIFICA_DATA
} from "../constants";
import { PAYMENT_VERIFY_OTP } from "./../constants";

export type StartPayment = Readonly<{
  type: typeof PAYMENT_START;
}>;

export type InsertDataManually = Readonly<{
  type: typeof PAYMENT_INSERT_DATA_MANUALLY;
}>;

export type StoreRptIdData = Readonly<{
  type: typeof PAYMENT_STORE_RPTID_DATA;
  payload: RptId;
}>;

export interface PaymentInfoPayload {
  rptId: RptId;
  initialAmount: AmountInEuroCents;
}

export type ShowPaymentSummary = Readonly<{
  type: typeof PAYMENT_SHOW_SUMMARY;
  payload?: PaymentInfoPayload;
}>;

export type StoreVerificaResponse = Readonly<{
  type: typeof PAYMENT_STORE_VERIFICA_DATA;
  payload: PaymentRequestsGetResponse;
}>;

export type StoreInitialAmount = Readonly<{
  type: typeof PAYMENT_STORE_INITIAL_AMOUNT;
  payload: AmountInEuroCents;
}>;

export type StoreSelectedPaymentMethod = Readonly<{
  type: typeof PAYMENT_STORE_SELECTED_PAYMENT_METHOD;
  payload: number;
}>;

export type ConfirmSummary = Readonly<{
  type: typeof PAYMENT_CONFIRM_SUMMARY;
}>;

export type PickPaymentMethod = Readonly<{
  type: typeof PAYMENT_PICK_PAYMENT_METHOD;
}>;

export type ConfirmPaymentMethod = Readonly<{
  type: typeof PAYMENT_CONFIRM_PAYMENT_METHOD;
  payload: number;
}>;

export type RequestOtp = Readonly<{
  type: typeof PAYMENT_REQUEST_OTP;
}>;

export type VerifyOtp = Readonly<{
  type: typeof PAYMENT_VERIFY_OTP;
  payload: string;
}>;

export type PaymentActions =
  | StartPayment
  | ShowPaymentSummary
  | StoreRptIdData
  | StoreVerificaResponse
  | StoreInitialAmount
  | InsertDataManually
  | ConfirmSummary
  | PickPaymentMethod
  | ConfirmPaymentMethod
  | StoreSelectedPaymentMethod
  | RequestOtp
  | VerifyOtp;

export const storeRptIdData = (rptId: RptId): StoreRptIdData => ({
  type: PAYMENT_STORE_RPTID_DATA,
  payload: rptId
});

export const showPaymentSummary = (
  paymentInfo?: PaymentInfoPayload
): ShowPaymentSummary => ({
  type: PAYMENT_SHOW_SUMMARY,
  payload: paymentInfo
});

export const startPayment = (): StartPayment => ({
  type: PAYMENT_START
});

export const storeVerificaResponse = (
  response: PaymentRequestsGetResponse
) => ({
  type: PAYMENT_STORE_VERIFICA_DATA,
  payload: response
});

export const storeInitialAmount = (
  amount: AmountInEuroCents
): StoreInitialAmount => ({
  type: PAYMENT_STORE_INITIAL_AMOUNT,
  payload: amount
});

export const insertDataManually = (): InsertDataManually => ({
  type: PAYMENT_INSERT_DATA_MANUALLY
});

export const confirmSummary = (): ConfirmSummary => ({
  type: PAYMENT_CONFIRM_SUMMARY
});

export const pickPaymentMethod = (): PickPaymentMethod => ({
  type: PAYMENT_PICK_PAYMENT_METHOD
});

export const confirmPaymentMethod = (
  walletId: number
): ConfirmPaymentMethod => ({
  type: PAYMENT_CONFIRM_PAYMENT_METHOD,
  payload: walletId
});

export const storeSelectedPaymentMethod = (walletId: number) => ({
  type: PAYMENT_STORE_SELECTED_PAYMENT_METHOD,
  payload: walletId
});

export const requestOtp = (): RequestOtp => ({
  type: PAYMENT_REQUEST_OTP
});

export const verifyOtp = (otp: string): VerifyOtp => ({
  type: PAYMENT_VERIFY_OTP,
  payload: otp
});
