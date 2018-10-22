import { RptId } from "italia-ts-commons/lib/pagopa";
import { TypeofApiResponse } from "italia-ts-commons/lib/requests";
import { ActionType, createStandardAction } from "typesafe-actions";

import { PaymentActivationsPostResponse } from "../../../../definitions/backend/PaymentActivationsPostResponse";
import { detailEnum as PaymentProblemErrorEnum } from "../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { CheckPaymentUsingGETT } from "../../../../definitions/pagopa/requestTypes";

import { Psp, Transaction, Wallet } from "../../../types/pagopa";
import { OmitStatusFromResponse, PayloadForAction } from "../../../types/utils";
import { fetchWalletsFailure, fetchWalletsSuccess } from "./wallets";

/**
 * Resets the payment state before starting a new payment
 */
export const paymentInitializeState = createStandardAction(
  "PAYMENT_INITIALIZE_STATE"
)();

//
// verifica
//

export const paymentVerificaRequest = createStandardAction(
  "PAYMENT_VERIFICA_REQUEST"
)<RptId>();

export const paymentVerificaSuccess = createStandardAction(
  "PAYMENT_VERIFICA_SUCCESS"
)<PaymentRequestsGetResponse>();

// the error is undefined in case we weren't able to decode it, it should be
// interpreted as a generic error
export const paymentVerificaFailure = createStandardAction(
  "PAYMENT_VERIFICA_FAILURE"
)<keyof typeof PaymentProblemErrorEnum | undefined>();

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

// the error is undefined in case we weren't able to decode it, it should be
// interpreted as a generic error
export const paymentAttivaFailure = createStandardAction(
  "PAYMENT_ATTIVA_FAILURE"
)<PaymentProblemErrorEnum | undefined>();

//
// paymentId polling
//

export const paymentIdPollingRequest = createStandardAction(
  "PAYMENT_ID_POLLING_REQUEST"
)<PaymentRequestsGetResponse>();

export const paymentIdPollingSuccess = createStandardAction(
  "PAYMENT_ID_POLLING_SUCCESS"
)<string>();

// the error is undefined in case we weren't able to decode it, it should be
// interpreted as a generic error
export const paymentIdPollingFailure = createStandardAction(
  "PAYMENT_ID_POLLING_FAILURE"
)<"PAYMENT_ID_TIMEOUT" | undefined>();

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
)<
  | OmitStatusFromResponse<TypeofApiResponse<CheckPaymentUsingGETT>, 200>
  | undefined
>();

//
// fetch psp list
//

export const paymentFetchPspsForPaymentIdRequest = createStandardAction(
  "PAYMENT_FETCH_PSPS_FOR_PAYMENT_ID_REQUEST"
)<string>();

export const paymentFetchPspsForPaymentIdSuccess = createStandardAction(
  "PAYMENT_FETCH_PSPS_FOR_PAYMENT_ID_SUCCESS"
)<ReadonlyArray<Psp>>();

export const paymentFetchPspsForPaymentIdFailure = createStandardAction(
  "PAYMENT_FETCH_PSPS_FOR_PAYMENT_ID_FAILURE"
)<Error>();

//
// Update Wallet PSP request and responses
//

type WalletUpdatePspRequestPayload = Readonly<{
  idPsp: number;
  wallet: Wallet;
  onSuccess?: (
    action: ActionType<typeof paymentUpdateWalletPspSuccess>
  ) => void;
  onFailure?: (
    action: ActionType<typeof paymentUpdateWalletPspFailure>
  ) => void;
}>;

export const paymentUpdateWalletPspRequest = createStandardAction(
  "PAYMENT_UPDATE_WALLET_PSP_REQUEST"
)<WalletUpdatePspRequestPayload>();

export const paymentUpdateWalletPspSuccess = createStandardAction(
  "PAYMENT_UPDATE_WALLET_PSP_SUCCESS"
)<PayloadForAction<typeof fetchWalletsSuccess>>();

export const paymentUpdateWalletPspFailure = createStandardAction(
  "PAYMENT_UPDATE_WALLET_PSP_FAILURE"
)<PayloadForAction<typeof fetchWalletsFailure>>();

//
// execute payment
//

type PaymentExecutePaymentRequestPayload = Readonly<{
  paymentId: string;
  wallet: Wallet;
  onSuccess?: (action: ActionType<typeof paymentExecutePaymentSuccess>) => void;
}>;

export const paymentExecutePaymentRequest = createStandardAction(
  "PAYMENT_EXECUTE_PAYMENT_REQUEST"
)<PaymentExecutePaymentRequestPayload>();

export const paymentExecutePaymentSuccess = createStandardAction(
  "PAYMENT_EXECUTE_PAYMENT_SUCCESS"
)<Transaction>();

export const paymentExecutePaymentFailure = createStandardAction(
  "PAYMENT_EXECUTE_PAYMENT_FAILURE"
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
  | ActionType<typeof paymentUpdateWalletPspRequest>
  | ActionType<typeof paymentUpdateWalletPspSuccess>
  | ActionType<typeof paymentUpdateWalletPspFailure>
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
  | ActionType<typeof paymentExecutePaymentRequest>
  | ActionType<typeof paymentExecutePaymentSuccess>
  | ActionType<typeof paymentExecutePaymentFailure>
  | ActionType<typeof runStartOrResumePaymentSaga>;
