import { Option } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { ActionType, createStandardAction } from "typesafe-actions";

import { PaymentActivationsPostResponse } from "../../../../definitions/backend/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";

import { PagoPaErrors } from "../../../types/errors";
import { Psp, PspListResponse, Wallet } from "../../../types/pagopa";

export const paymentInitializeState = createStandardAction(
  "PAYMENT_INITIALIZE_STATE"
)();

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

type WalletUpdatePspRequestPayload = Readonly<{
  idPsp: number;
  wallet: Wallet;
  onSuccess?: (
    action: ActionType<typeof paymentUpdateWalletPspSuccess>
  ) => void;
}>;

export const paymentUpdateWalletPspRequest = createStandardAction(
  "PAYMENT_UPDATE_WALLET_PSP_REQUEST"
)<WalletUpdatePspRequestPayload>();

export const paymentUpdateWalletPspSuccess = createStandardAction(
  "PAYMENT_UPDATE_WALLET_PSP_SUCCESS"
)<ReadonlyArray<Wallet>>();

export const paymentUpdateWalletPspFailure = createStandardAction(
  "PAYMENT_UPDATE_WALLET_PSP_FAILURE"
)<Error>();

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

//
// verifica
//

export const paymentVerificaRequest = createStandardAction(
  "PAYMENT_VERIFICA_REQUEST"
)<RptId>();

export const paymentVerificaSuccess = createStandardAction(
  "PAYMENT_VERIFICA_SUCCESS"
)<PaymentRequestsGetResponse>();

export const paymentVerificaFailure = createStandardAction(
  "PAYMENT_VERIFICA_FAILURE"
)<Error>();

//
// attiva
//

type paymentAttivaRequestPayload = Readonly<{
  rptId: RptId;
  verifica: PaymentRequestsGetResponse;
}>;

export const paymentAttivaRequest = createStandardAction(
  "PAYMENT_ATTIVA_REQUEST"
)<paymentAttivaRequestPayload>();

export const paymentAttivaSuccess = createStandardAction(
  "PAYMENT_ATTIVA_SUCCESS"
)<PaymentActivationsPostResponse>();

export const paymentAttivaFailure = createStandardAction(
  "PAYMENT_ATTIVA_FAILURE"
)<Error>();

//
// paymentId polling
//

export const paymentIdPollingRequest = createStandardAction(
  "PAYMENT_ID_POLLING_REQUEST"
)<PaymentRequestsGetResponse>();

export const paymentIdPollingSuccess = createStandardAction(
  "PAYMENT_ID_POLLING_SUCCESS"
)<string>();

export const paymentIdPollingFailure = createStandardAction(
  "PAYMENT_ID_POLLING_FAILURE"
)<Error>();

//
// check payment
//

export const paymentCheckRequest = createStandardAction(
  "PAYMENT_CHECK_REQUEST"
)<string>();

export const paymentCheckSuccess = createStandardAction(
  "PAYMENT_CHECK_SUCCESS"
)<true>();

export const paymentCheckFailure = createStandardAction(
  "PAYMENT_CHECK_FAILURE"
)<Error>();

//
// fetch psp list
//

export const paymentFetchPspsForPaymentIdRequest = createStandardAction(
  "PAYMENT_FETCH_PSPS_FOR_PAYMENT_ID_REQUEST"
)<string>();

export const paymentFetchPspsForPaymentIdSuccess = createStandardAction(
  "PAYMENT_FETCH_PSPS_FOR_PAYMENT_ID_SUCCESS"
)<PspListResponse>();

export const paymentFetchPspsForPaymentIdFailure = createStandardAction(
  "PAYMENT_FETCH_PSPS_FOR_PAYMENT_ID_FAILURE"
)<Error>();

//
// run startOrResumePaymentSaga
//

type RunStartOrResumePaymentSagaPayload = Readonly<{
  rptId: RptId;
  verifica: PaymentRequestsGetResponse;
  onSuccess: (paymentId: string, psps: ReadonlyArray<Psp>) => void;
}>;

export const runStartOrResumePaymentSaga = createStandardAction(
  "PAYMENT_RUN_START_OR_RESUME_PAYMENT_SAGA"
)<RunStartOrResumePaymentSagaPayload>();

/**
 * All possible payment actions
 */
export type PaymentActions =
  | ActionType<typeof paymentInitializeState>
  | ActionType<typeof paymentRequestTransactionSummaryFromBanner>
  | ActionType<typeof paymentRequestContinueWithPaymentMethods>
  | ActionType<typeof paymentRequestPickPaymentMethod>
  | ActionType<typeof paymentRequestConfirmPaymentMethod>
  | ActionType<typeof paymentRequestPickPsp>
  | ActionType<typeof paymentUpdateWalletPspRequest>
  | ActionType<typeof paymentUpdateWalletPspSuccess>
  | ActionType<typeof paymentUpdateWalletPspFailure>
  | ActionType<typeof paymentRequestCompletion>
  | ActionType<typeof goBackOnePaymentState>
  | ActionType<typeof paymentRequestGoBack>
  | ActionType<typeof paymentCancel>
  | ActionType<typeof paymentRequestCancel>
  | ActionType<typeof paymentFailure>
  | ActionType<typeof paymentVerificaRequest>
  | ActionType<typeof paymentVerificaSuccess>
  | ActionType<typeof paymentVerificaFailure>
  | ActionType<typeof paymentAttivaRequest>
  | ActionType<typeof paymentAttivaSuccess>
  | ActionType<typeof paymentAttivaFailure>
  | ActionType<typeof paymentIdPollingRequest>
  | ActionType<typeof paymentIdPollingSuccess>
  | ActionType<typeof paymentIdPollingFailure>
  | ActionType<typeof paymentCheckRequest>
  | ActionType<typeof paymentCheckSuccess>
  | ActionType<typeof paymentCheckFailure>
  | ActionType<typeof paymentFetchPspsForPaymentIdRequest>
  | ActionType<typeof paymentFetchPspsForPaymentIdSuccess>
  | ActionType<typeof paymentFetchPspsForPaymentIdFailure>
  | ActionType<typeof runStartOrResumePaymentSaga>;
