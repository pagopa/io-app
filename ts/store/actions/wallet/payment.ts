import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { NodoErrors } from "../../../sagas/wallet";
import { Psp } from "../../../types/pagopa";
import {
  PAYMENT_CANCEL,
  PAYMENT_COMPLETED,
  PAYMENT_CONFIRM_PAYMENT_METHOD,
  PAYMENT_FAILURE,
  PAYMENT_GO_BACK,
  PAYMENT_INITIAL_CONFIRM_PAYMENT_METHOD,
  PAYMENT_INITIAL_PICK_PAYMENT_METHOD,
  PAYMENT_INITIAL_PICK_PSP,
  PAYMENT_MANUAL_ENTRY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_PICK_PSP,
  PAYMENT_QR_CODE,
  PAYMENT_REQUEST_CANCEL,
  PAYMENT_REQUEST_COMPLETION,
  PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
  PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
  PAYMENT_REQUEST_GO_BACK,
  PAYMENT_REQUEST_MANUAL_ENTRY,
  PAYMENT_REQUEST_MESSAGE,
  PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
  PAYMENT_REQUEST_PICK_PSP,
  PAYMENT_REQUEST_QR_CODE,
  PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  PAYMENT_RESET_LOADING,
  PAYMENT_SET_LOADING,
  PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER,
  PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID,
  PAYMENT_UPDATE_PSP,
  PAYMENT_UPDATE_PSP_IN_STATE
} from "../constants";

export type PaymentRequestQrCode = Readonly<{
  type: typeof PAYMENT_REQUEST_QR_CODE;
}>;

type PaymentQrCode = Readonly<{
  type: typeof PAYMENT_QR_CODE;
}>;

export type PaymentRequestManualEntry = Readonly<{
  type: typeof PAYMENT_REQUEST_MANUAL_ENTRY;
}>;

type PaymentManualEntry = Readonly<{
  type: typeof PAYMENT_MANUAL_ENTRY;
}>;

export type PaymentRequestMessage = Readonly<{
  type: typeof PAYMENT_REQUEST_MESSAGE;
}>;

// for the first time the screen is being shown (i.e. after the
// rptId has been passed (from qr code/manual entry/message)
type PaymentRequestTransactionSummaryFromRptId = Readonly<{
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

type PaymentTransactionSummaryFromRptId = Readonly<{
  type: typeof PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID;
  payload: {
    rptId: RptId;
    verificaResponse: PaymentRequestsGetResponse;
    initialAmount: AmountInEuroCents;
  };
}>;

type PaymentTransactionSummaryFromBanner = Readonly<{
  type: typeof PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER;
}>;

type PaymentTransactionSummaryActions =
  | PaymentTransactionSummaryFromRptId
  | PaymentTransactionSummaryFromBanner;

export type PaymentRequestContinueWithPaymentMethods = Readonly<{
  type: typeof PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS;
}>;

export type PaymentRequestPickPaymentMethod = Readonly<{
  type: typeof PAYMENT_REQUEST_PICK_PAYMENT_METHOD;
}>;

type PaymentPickPaymentMethod = Readonly<{
  type: typeof PAYMENT_PICK_PAYMENT_METHOD;
}>;

type PaymentInitialPickPaymentMethod = Readonly<{
  type: typeof PAYMENT_INITIAL_PICK_PAYMENT_METHOD;
  payload: string; // paymentId
}>;

export type PaymentRequestConfirmPaymentMethod = Readonly<{
  type: typeof PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD;
  payload: number; // selected wallet id
}>;

type PaymentConfirmPaymentMethod = Readonly<{
  type: typeof PAYMENT_CONFIRM_PAYMENT_METHOD;
  payload: {
    selectedPaymentMethod: number; // selected wallet id
    pspList: ReadonlyArray<Psp>; // list of available PSPs
  };
}>;

type PaymentInitialConfirmPaymentMethod = Readonly<{
  type: typeof PAYMENT_INITIAL_CONFIRM_PAYMENT_METHOD;
  payload: {
    selectedPaymentMethod: number; // selected wallet id
    paymentId: string;
    pspList: ReadonlyArray<Psp>; // list of available PSPs
  };
}>;

export type PaymentRequestCompletion = Readonly<{
  type: typeof PAYMENT_REQUEST_COMPLETION;
}>;

export type PaymentCompleted = Readonly<{
  type: typeof PAYMENT_COMPLETED;
}>;

// action for showing the psp list screen
export type PaymentRequestPickPsp = Readonly<{
  type: typeof PAYMENT_REQUEST_PICK_PSP;
}>;

// action for updating the redux state
// as required by the psp list screen
type PaymentPickPsp = Readonly<{
  type: typeof PAYMENT_PICK_PSP;
  payload: {
    selectedPaymentMethod: number; // selected wallet id
    pspList: ReadonlyArray<Psp>; // list of available PSPs
  };
}>;

// action for selecting a PSP
export type PaymentUpdatePsp = Readonly<{
  type: typeof PAYMENT_UPDATE_PSP;
  payload: number; // pspId
}>;

// TODO: temporary action until integration with pagoPA occurs
// @https://www.pivotaltracker.com/story/show/159494746
type PaymentUpdatePspInState = Readonly<{
  type: typeof PAYMENT_UPDATE_PSP_IN_STATE;
  walletId: number;
  payload: Psp; // pspId
}>;

type PaymentInitialPickPsp = Readonly<{
  type: typeof PAYMENT_INITIAL_PICK_PSP;
  payload: {
    selectedPaymentMethod: number; // selected wallet id
    paymentId: string;
    pspList: ReadonlyArray<Psp>; // list of available PSPs
  };
}>;

type PaymentGoBack = Readonly<{
  type: typeof PAYMENT_GO_BACK;
}>;

export type PaymentRequestGoBack = Readonly<{
  type: typeof PAYMENT_REQUEST_GO_BACK;
}>;

export type PaymentSetLoadingState = Readonly<{
  type: typeof PAYMENT_SET_LOADING;
}>;

export type PaymentResetLoadingState = Readonly<{
  type: typeof PAYMENT_RESET_LOADING;
}>;

export type PaymentCancel = Readonly<{
  type: typeof PAYMENT_CANCEL;
}>;

export type PaymentRequestCancel = Readonly<{
  type: typeof PAYMENT_REQUEST_CANCEL;
}>;

export type PaymentFailure = Readonly<{
  type: typeof PAYMENT_FAILURE;
  payload: NodoErrors;
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
  | PaymentInitialPickPaymentMethod
  | PaymentRequestConfirmPaymentMethod
  | PaymentConfirmPaymentMethod
  | PaymentInitialConfirmPaymentMethod
  | PaymentRequestPickPsp
  | PaymentPickPsp
  | PaymentInitialPickPsp
  | PaymentUpdatePsp
  | PaymentUpdatePspInState // TODO: temporary, until integration with pagoPA occurs @https://www.pivotaltracker.com/story/show/159494746
  | PaymentRequestCompletion
  | PaymentCompleted
  | PaymentGoBack
  | PaymentRequestGoBack
  | PaymentSetLoadingState
  | PaymentResetLoadingState
  | PaymentCancel
  | PaymentRequestCancel
  | PaymentFailure;

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

export const paymentInitialPickPaymentMethod = (
  paymentId: string
): PaymentInitialPickPaymentMethod => ({
  type: PAYMENT_INITIAL_PICK_PAYMENT_METHOD,
  payload: paymentId
});

export const paymentRequestConfirmPaymentMethod = (
  walletId: number
): PaymentRequestConfirmPaymentMethod => ({
  type: PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
  payload: walletId
});

export const paymentConfirmPaymentMethod = (
  walletId: number,
  pspList: ReadonlyArray<Psp>
): PaymentConfirmPaymentMethod => ({
  type: PAYMENT_CONFIRM_PAYMENT_METHOD,
  payload: { selectedPaymentMethod: walletId, pspList }
});

export const paymentInitialConfirmPaymentMethod = (
  walletId: number,
  pspList: ReadonlyArray<Psp>,
  paymentId: string
): PaymentInitialConfirmPaymentMethod => ({
  type: PAYMENT_INITIAL_CONFIRM_PAYMENT_METHOD,
  payload: { selectedPaymentMethod: walletId, pspList, paymentId }
});

export const paymentRequestPickPsp = (): PaymentRequestPickPsp => ({
  type: PAYMENT_REQUEST_PICK_PSP
});

export const paymentInitialPickPsp = (
  walletId: number,
  pspList: ReadonlyArray<Psp>,
  paymentId: string
): PaymentInitialPickPsp => ({
  type: PAYMENT_INITIAL_PICK_PSP,
  payload: { selectedPaymentMethod: walletId, pspList, paymentId }
});

export const paymentPickPsp = (
  walletId: number,
  pspList: ReadonlyArray<Psp>
): PaymentPickPsp => ({
  type: PAYMENT_PICK_PSP,
  payload: { selectedPaymentMethod: walletId, pspList }
});

export const paymentUpdatePsp = (pspId: number): PaymentUpdatePsp => ({
  type: PAYMENT_UPDATE_PSP,
  payload: pspId
});

export const paymentRequestCompletion = (): PaymentRequestCompletion => ({
  type: PAYMENT_REQUEST_COMPLETION
});

export const paymentGoBack = (): PaymentGoBack => ({
  type: PAYMENT_GO_BACK
});

export const paymentRequestGoBack = (): PaymentRequestGoBack => ({
  type: PAYMENT_REQUEST_GO_BACK
});

export const paymentSetLoadingState = (): PaymentSetLoadingState => ({
  type: PAYMENT_SET_LOADING
});

export const paymentResetLoadingState = (): PaymentResetLoadingState => ({
  type: PAYMENT_RESET_LOADING
});

export const paymentCancel = (): PaymentCancel => ({
  type: PAYMENT_CANCEL
});

export const paymentRequestCancel = (): PaymentRequestCancel => ({
  type: PAYMENT_REQUEST_CANCEL
});

export const paymentFailure = (error: NodoErrors): PaymentFailure => ({
  type: PAYMENT_FAILURE,
  payload: error
});
