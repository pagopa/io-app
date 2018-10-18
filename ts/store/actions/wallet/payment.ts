import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { ActionType, createStandardAction } from "typesafe-actions";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";

import { Option } from "fp-ts/lib/Option";
import { PagoPaErrors } from "../../../types/errors";
import { Psp, PspListResponse, Wallet } from "../../../types/pagopa";

export const resetPaymentState = createStandardAction("PAYMENT_COMPLETED")();

export const startPaymentSaga = createStandardAction("PAYMENT_REQUEST")();

type PaymentRequestTransactionSummaryFromRptIdPayload = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
}>;

// for the first time the screen is being shown (i.e. after the
// rptId has been passed (from qr code/manual entry/message)
export const paymentRequestTransactionSummaryFromRptId = createStandardAction(
  "PAYMENT_REQUEST_TRANSACTION_SUMMARY_FROM_RPTID"
)<PaymentRequestTransactionSummaryFromRptIdPayload>();

export const paymentRequestTransactionSummaryFromBanner = createStandardAction(
  "PAYMENT_REQUEST_TRANSACTION_SUMMARY_FROM_BANNER"
)();

type PaymentRequestContinueWithPaymentMethodsPayload = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  maybePaymentId: Option<string>;
}>;

export const paymentRequestContinueWithPaymentMethods = createStandardAction(
  "PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS"
)<PaymentRequestContinueWithPaymentMethodsPayload>();

type PaymentRequestPickPaymentMethodPayload = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  paymentId: string;
}>;

export const paymentRequestPickPaymentMethod = createStandardAction(
  "PAYMENT_REQUEST_PICK_PAYMENT_METHOD"
)<PaymentRequestPickPaymentMethodPayload>();

type PaymentRequestConfirmPaymentMethodPayload = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  wallet: Wallet;
  paymentId: string;
}>;

export const paymentRequestConfirmPaymentMethod = createStandardAction(
  "PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD"
)<PaymentRequestConfirmPaymentMethodPayload>();

type PaymentRequestPickPspPayload = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  wallet: Wallet;
  pspList: ReadonlyArray<Psp>;
  paymentId: string;
}>;

export const paymentRequestPickPsp = createStandardAction(
  "PAYMENT_REQUEST_PICK_PSP"
)<PaymentRequestPickPspPayload>();

type PaymentUpdatePspPayload = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  pspId: number;
  wallet: Wallet;
  paymentId: string;
}>;

export const paymentUpdatePsp = createStandardAction("PAYMENT_UPDATE_PSP")<
  PaymentUpdatePspPayload
>();

type PaymentRequestCompletionPayload = Readonly<{
  wallet: Wallet;
  paymentId: string;
}>;

export const paymentRequestCompletion = createStandardAction(
  "PAYMENT_REQUEST_COMPLETION"
)<PaymentRequestCompletionPayload>();

export const goBackOnePaymentState = createStandardAction("PAYMENT_GO_BACK")();

export const paymentRequestGoBack = createStandardAction(
  "PAYMENT_REQUEST_GO_BACK"
)();

export const paymentCancel = createStandardAction("PAYMENT_CANCEL")();

export const paymentRequestCancel = createStandardAction(
  "PAYMENT_REQUEST_CANCEL"
)();

export const paymentFailure = createStandardAction("PAYMENT_FAILURE")<
  PagoPaErrors
>();

export const paymentVerificaRequest = createStandardAction(
  "PAYMENT_VERIFICA_REQUEST"
)();

export const paymentVerificaSuccess = createStandardAction(
  "PAYMENT_VERIFICA_SUCCESS"
)<PaymentRequestsGetResponse>();

export const paymentVerificaFailure = createStandardAction(
  "PAYMENT_VERIFICA_FAILURE"
)<Error>();

export const paymentPspListRequest = createStandardAction(
  "PAYMENT_PSPLIST_REQUEST"
)();

export const paymentPspListSuccess = createStandardAction(
  "PAYMENT_PSPLIST_SUCCESS"
)<PspListResponse>();

export const paymentPspListFailure = createStandardAction(
  "PAYMENT_PSPLIST_FAILURE"
)<Error>();

/**
 * All possible payment actions
 */
export type PaymentActions =
  | ActionType<typeof startPaymentSaga>
  | ActionType<typeof paymentRequestTransactionSummaryFromBanner>
  | ActionType<typeof paymentRequestTransactionSummaryFromRptId>
  | ActionType<typeof paymentRequestContinueWithPaymentMethods>
  | ActionType<typeof paymentRequestPickPaymentMethod>
  | ActionType<typeof paymentRequestConfirmPaymentMethod>
  | ActionType<typeof paymentRequestPickPsp>
  | ActionType<typeof paymentUpdatePsp>
  | ActionType<typeof paymentRequestCompletion>
  | ActionType<typeof resetPaymentState>
  | ActionType<typeof goBackOnePaymentState>
  | ActionType<typeof paymentRequestGoBack>
  | ActionType<typeof paymentCancel>
  | ActionType<typeof paymentRequestCancel>
  | ActionType<typeof paymentFailure>
  | ActionType<typeof paymentVerificaRequest>
  | ActionType<typeof paymentVerificaSuccess>
  | ActionType<typeof paymentVerificaFailure>
  | ActionType<typeof paymentPspListRequest>
  | ActionType<typeof paymentPspListSuccess>
  | ActionType<typeof paymentPspListFailure>;
