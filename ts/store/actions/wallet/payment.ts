import { RptId, AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import {
  STORE_RPTID_DATA,
  PAYMENT_SHOW_SUMMARY,
  STORE_INITIAL_AMOUNT,
  STORE_VERIFICA_DATA,
  START_PAYMENT,
  PAYMENT_INSERT_DATA_MANUALLY,
  PAYMENT_CONFIRM_SUMMARY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_CONFIRM_PAYMENT_METHOD,
  PAYMENT_STORE_SELECTED_PAYMENT_METHOD
} from "../constants";
import { PaymentRequestsGetResponse } from "../../../../definitions/pagopa-proxy/PaymentRequestsGetResponse";
import { CreditCardId } from "../../../types/CreditCard";

export type StartPayment = Readonly<{
  type: typeof START_PAYMENT;
}>;

export type InsertDataManually = Readonly<{
  type: typeof PAYMENT_INSERT_DATA_MANUALLY;
}>;

export type StoreRptIdData = Readonly<{
  type: typeof STORE_RPTID_DATA;
  payload: RptId;
}>;

export type ShowPaymentSummary = Readonly<{
  type: typeof PAYMENT_SHOW_SUMMARY;
  payload: { rptId: RptId; initialAmount: AmountInEuroCents };
}>;

export type StoreVerificaResponse = Readonly<{
  type: typeof STORE_VERIFICA_DATA;
  payload: PaymentRequestsGetResponse;
}>;

export type StoreInitialAmount = Readonly<{
  type: typeof STORE_INITIAL_AMOUNT;
  payload: AmountInEuroCents;
}>;

export type StoreSelectedPaymentMethod = Readonly<{
  type: typeof PAYMENT_STORE_SELECTED_PAYMENT_METHOD;
  payload: CreditCardId;
}>;

export type ConfirmSummary = Readonly<{
  type: typeof PAYMENT_CONFIRM_SUMMARY;
}>;

export type PickPaymentMethod = Readonly<{
  type: typeof PAYMENT_PICK_PAYMENT_METHOD;
}>;

export type ConfirmPaymentMethod = Readonly<{
  type: typeof PAYMENT_CONFIRM_PAYMENT_METHOD;
  payload: CreditCardId;
}>;

export type PaymentAction =
  | StartPayment
  | ShowPaymentSummary
  | StoreRptIdData
  | StoreVerificaResponse
  | StoreInitialAmount
  | InsertDataManually
  | ConfirmSummary
  | PickPaymentMethod
  | ConfirmPaymentMethod
  | StoreSelectedPaymentMethod;

export const storeRptIdData = (rptId: RptId): StoreRptIdData => ({
  type: STORE_RPTID_DATA,
  payload: rptId
});

export const showPaymentSummary = (
  rptId: RptId,
  initialAmount: AmountInEuroCents
): ShowPaymentSummary => ({
  type: PAYMENT_SHOW_SUMMARY,
  payload: {
    rptId,
    initialAmount
  }
});

export const startPayment = (): StartPayment => ({
  type: START_PAYMENT
});

export const storeVerificaResponse = (
  response: PaymentRequestsGetResponse
) => ({
  type: STORE_VERIFICA_DATA,
  payload: response
});

export const storeInitialAmount = (
  amount: AmountInEuroCents
): StoreInitialAmount => ({
  type: STORE_INITIAL_AMOUNT,
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
  creditCardId: CreditCardId
): ConfirmPaymentMethod => ({
  type: PAYMENT_CONFIRM_PAYMENT_METHOD,
  payload: creditCardId
});

export const storeSelectedPaymentMethod = (creditCardId: CreditCardId) => ({
  type: PAYMENT_STORE_SELECTED_PAYMENT_METHOD,
  payload: creditCardId
});
