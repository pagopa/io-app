import {
  OmitStatusFromResponse,
  TypeofApiResponse
} from "@pagopa/ts-commons/lib/requests";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";

import { PaymentActivationsPostResponse } from "../../../../definitions/backend/PaymentActivationsPostResponse";
import { Detail_v2Enum as PaymentProblemErrorEnum } from "../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { CheckPaymentUsingGETT } from "../../../../definitions/pagopa/requestTypes";
import {
  PaymentManagerToken,
  RawPaymentMethod,
  Transaction,
  Wallet
} from "../../../types/pagopa";
import { PayloadForAction } from "../../../types/utils";
import {
  EntrypointRoute,
  PaymentStartPayload
} from "../../reducers/wallet/payment";
import { OutcomeCodesKey } from "../../../types/outcomeCode";
import { NetworkError } from "../../../utils/errors";
import { PspData } from "../../../../definitions/pagopa/PspData";
import { fetchWalletsFailure, fetchWalletsSuccess } from "./wallets";

/**
 * IMPORTANT!
 *
 * The payment flow is quite complex and involves more than two actors.
 * Please refer to https://docs.google.com/presentation/d/11rEttb7lJYlRqgFpl4QopyjFmjt2Q0K8uis6JhAQaCw/edit#slide=id.p
 * and make sure you understand it _before_ working on it.
 */

export type PaymentStartOrigin =
  | "message"
  | "qrcode_scan"
  | "poste_datamatrix_scan"
  | "manual_insertion"
  | "donation";

/**
 * Resets the payment state before starting a new payment
 */
export const paymentInitializeState = createStandardAction(
  "PAYMENT_INITIALIZE_STATE"
)();

/**
 * Track the route whence the payment started
 */
export const paymentInitializeEntrypointRoute = createStandardAction(
  "PAYMENT_ENTRYPOINT_ROUTE"
)<EntrypointRoute>();

/**
 * For back to entrypoint (where the payment is initiated)
 */
export const backToEntrypointPayment = createStandardAction(
  "BACK_TO_PAYMENT_ENTRYPOINT_ROUTE"
)();

//
// verifica
//

// the error is undefined in case we weren't able to decode it, it should be
// interpreted as a generic error
export const paymentVerifica = createAsyncAction(
  "PAYMENT_VERIFICA_REQUEST",
  "PAYMENT_VERIFICA_SUCCESS",
  "PAYMENT_VERIFICA_FAILURE"
)<
  { rptId: RptId; startOrigin: PaymentStartOrigin },
  PaymentRequestsGetResponse,
  keyof typeof PaymentProblemErrorEnum | undefined
>();

//
// attiva
//

type paymentAttivaRequestPayload = Readonly<{
  rptId: RptId;
  verifica: PaymentRequestsGetResponse;
}>;

// the error is undefined in case we weren't able to decode it, it should be
// interpreted as a generic error
export const paymentAttiva = createAsyncAction(
  "PAYMENT_ATTIVA_REQUEST",
  "PAYMENT_ATTIVA_SUCCESS",
  "PAYMENT_ATTIVA_FAILURE"
)<
  paymentAttivaRequestPayload,
  PaymentActivationsPostResponse,
  PaymentProblemErrorEnum | undefined
>();

//
// paymentId polling
//

// the error is undefined in case we weren't able to decode it, it should be
// interpreted as a generic error
export const paymentIdPolling = createAsyncAction(
  "PAYMENT_ID_POLLING_REQUEST",
  "PAYMENT_ID_POLLING_SUCCESS",
  "PAYMENT_ID_POLLING_FAILURE"
)<PaymentRequestsGetResponse, string, "PAYMENT_ID_TIMEOUT" | undefined>();

//
// check payment
//

export const paymentCheck = createAsyncAction(
  "PAYMENT_CHECK_REQUEST",
  "PAYMENT_CHECK_SUCCESS",
  "PAYMENT_CHECK_FAILURE"
)<
  string,
  true,
  | OmitStatusFromResponse<TypeofApiResponse<CheckPaymentUsingGETT>, 200>
  | undefined
  | Error
>();

//
// Update Wallet PSP request and responses
//

type WalletUpdatePspRequestPayload = Readonly<{
  psp: PspData;
  wallet: Wallet;
  idPayment: string;
  onSuccess?: (
    action: ActionType<typeof paymentUpdateWalletPsp["success"]>
  ) => void;
  onFailure?: (
    action: ActionType<typeof paymentUpdateWalletPsp["failure"]>
  ) => void;
}>;

export const paymentUpdateWalletPsp = createAsyncAction(
  "PAYMENT_UPDATE_WALLET_PSP_REQUEST",
  "PAYMENT_UPDATE_WALLET_PSP_SUCCESS",
  "PAYMENT_UPDATE_WALLET_PSP_FAILURE"
)<
  WalletUpdatePspRequestPayload,
  {
    wallets: PayloadForAction<typeof fetchWalletsSuccess>;
    updatedWallet: Wallet;
  },
  PayloadForAction<typeof fetchWalletsFailure>
>();

//
// execute payment
//

/**
 * user wants to pay
 * - request: we already know the idPayment and the idWallet used to pay, we need a fresh PM session token
 * - success: we got a fresh PM session token
 * - failure: we can't get a fresh PM session token
 */
export const paymentExecuteStart = createAsyncAction(
  "PAYMENT_EXECUTE_START_REQUEST",
  "PAYMENT_EXECUTE_START_SUCCESS",
  "PAYMENT_EXECUTE_START_FAILURE"
)<PaymentStartPayload, PaymentManagerToken, Error>();

export type PaymentWebViewEndReason = "USER_ABORT" | "EXIT_PATH";
export type PaymentMethodType =
  | Extract<RawPaymentMethod["kind"], "CreditCard" | "PayPal" | "BPay">
  | "Unknown";
// event fired when the paywebview ends its challenge (used to reset payment values)
export const paymentWebViewEnd = createStandardAction("PAYMENT_WEB_VIEW_END")<{
  reason: PaymentWebViewEndReason;
  paymentMethodType: PaymentMethodType;
}>();

// used to accumulate all the urls browsed into the pay webview
export const paymentRedirectionUrls = createStandardAction(
  "PAYMENT_NAVIGATION_URLS"
)<ReadonlyArray<string>>();

//
// Signal the completion of a payment
//

type PaymentCompletedSuccessPayload = Readonly<
  | {
      kind: "COMPLETED";
      // TODO Transaction is not available, add it when PM makes it available again
      //  see https://www.pivotaltracker.com/story/show/177067134
      transaction: Transaction | undefined;
      rptId: RptId;
    }
  | {
      kind: "DUPLICATED";
      rptId: RptId;
    }
>;

export const paymentCompletedSuccess = createStandardAction(
  "PAYMENT_COMPLETED_SUCCESS"
)<PaymentCompletedSuccessPayload>();

export const paymentCompletedFailure = createStandardAction(
  "PAYMENT_COMPLETED_FAILURE"
)<{ outcomeCode: OutcomeCodesKey | undefined; paymentId: string }>();

//
// delete an ongoing payment
//

type PaymentDeletePaymentRequestPayload = Readonly<{
  paymentId: string;
}>;

export const paymentDeletePayment = createAsyncAction(
  "PAYMENT_DELETE_PAYMENT_REQUEST",
  "PAYMENT_DELETE_PAYMENT_SUCCESS",
  "PAYMENT_DELETE_PAYMENT_FAILURE"
)<PaymentDeletePaymentRequestPayload, void, Error>();

export const runDeleteActivePaymentSaga = createStandardAction(
  "PAYMENT_RUN_DELETE_ACTIVE_PAYMENT_SAGA"
)();

// abort payment just before pay
export const abortRunningPayment = createStandardAction(
  "PAYMENT_ABORT_RUNNING_PAYMENT"
)();

//
// run startOrResumePaymentSaga
//

type RunStartOrResumePaymentActivationSagaPayload = Readonly<{
  rptId: RptId;
  verifica: PaymentRequestsGetResponse;
  onSuccess: (idPayment: string) => void;
}>;

export const runStartOrResumePaymentActivationSaga = createStandardAction(
  "PAYMENT_RUN_START_OR_RESUME_PAYMENT_ACTIVATION_SAGA"
)<RunStartOrResumePaymentActivationSagaPayload>();

/**
 * the psp selected for the payment
 */
export const pspSelectedForPaymentV2 = createStandardAction(
  "PAYMENT_PSP_V2_SELECTED"
)<PspData>();

/**
 * get the list of psp that can handle the payment with the given paymentMethod
 */
export const pspForPaymentV2 = createAsyncAction(
  "PAYMENT_PSP_V2_REQUEST",
  "PAYMENT_PSP_V2_SUCCESS",
  "PAYMENT_PSP_V2_FAILURE"
)<
  { idWallet: number; idPayment: string },
  ReadonlyArray<PspData>,
  NetworkError
>();

/**
 * @deprecated
 * this action is used only to mimic the existing payment logic (callbacks hell 😈)
 * use {@link pspForPaymentV2} instead
 */
export const pspForPaymentV2WithCallbacks = createStandardAction(
  "PAYMENT_PSP_V2_WITH_CALLBACKS"
)<{
  idWallet: number;
  idPayment: string;
  onSuccess: (psp: ReadonlyArray<PspData>) => void;
  onFailure: () => void;
}>();

/**
 * All possible payment actions
 */
export type PaymentActions =
  | ActionType<typeof paymentInitializeState>
  | ActionType<typeof paymentInitializeEntrypointRoute>
  | ActionType<typeof backToEntrypointPayment>
  | ActionType<typeof paymentUpdateWalletPsp>
  | ActionType<typeof paymentVerifica>
  | ActionType<typeof paymentAttiva>
  | ActionType<typeof paymentIdPolling>
  | ActionType<typeof paymentWebViewEnd>
  | ActionType<typeof paymentCheck>
  | ActionType<typeof paymentExecuteStart>
  | ActionType<typeof paymentCompletedSuccess>
  | ActionType<typeof paymentCompletedFailure>
  | ActionType<typeof paymentDeletePayment>
  | ActionType<typeof runDeleteActivePaymentSaga>
  | ActionType<typeof abortRunningPayment>
  | ActionType<typeof paymentRedirectionUrls>
  | ActionType<typeof runStartOrResumePaymentActivationSaga>
  | ActionType<typeof pspForPaymentV2>
  | ActionType<typeof pspSelectedForPaymentV2>
  | ActionType<typeof pspForPaymentV2WithCallbacks>;
