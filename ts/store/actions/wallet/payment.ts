import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { PagoPaErrors } from "../../../types/errors";
import { Psp } from "../../../types/pagopa";
import {
  PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  PAYMENT_UPDATE_PSP_IN_STATE
} from "../constants";

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

type PaymentTransactionSummaryActions =
  | ActionType<typeof paymentTransactionSummaryFromRptId>
  | ActionType<typeof paymentTransactionSummaryFromBanner>;

export const paymentCompleted = createStandardAction("PAYMENT_COMPLETED")();

// TODO: temporary action until integration with pagoPA occurs
// @https://www.pivotaltracker.com/story/show/159494746
type PaymentUpdatePspInState = Readonly<{
  type: typeof PAYMENT_UPDATE_PSP_IN_STATE;
  walletId: number;
  payload: Psp; // pspId
}>;

/**
 * All possible payment actions
 */
export type PaymentActions =
  | ActionType<typeof paymentRequestQrCode>
  | ActionType<typeof paymentQrCode>
  | ActionType<typeof paymentRequestManualEntry>
  | ActionType<typeof paymentRequestMessage>
  | ActionType<typeof paymentManualEntry>
  | PaymentRequestTransactionSummaryActions
  | PaymentTransactionSummaryActions
  | ActionType<typeof paymentRequestContinueWithPaymentMethods>
  | ActionType<typeof paymentRequestPickPaymentMethod>
  | ActionType<typeof paymentPickPaymentMethod>
  | ActionType<typeof paymentInitialPickPaymentMethod>
  | ActionType<typeof paymentRequestConfirmPaymentMethod>
  | ActionType<typeof paymentConfirmPaymentMethod>
  | ActionType<typeof paymentInitialConfirmPaymentMethod>
  | ActionType<typeof paymentRequestPickPsp>
  | ActionType<typeof paymentPickPsp>
  | ActionType<typeof paymentInitialPickPsp>
  | ActionType<typeof paymentUpdatePsp>
  | PaymentUpdatePspInState // TODO: temporary, until integration with pagoPA occurs @https://www.pivotaltracker.com/story/show/159494746
  | ActionType<typeof paymentRequestCompletion>
  | ActionType<typeof paymentCompleted>
  | ActionType<typeof paymentGoBack>
  | ActionType<typeof paymentRequestGoBack>
  | ActionType<typeof paymentSetLoadingState>
  | ActionType<typeof paymentResetLoadingState>
  | ActionType<typeof paymentCancel>
  | ActionType<typeof paymentRequestCancel>
  | ActionType<typeof paymentRequestPinLogin>
  | ActionType<typeof paymentPinLogin>
  | ActionType<typeof paymentFailure>;

export const paymentRequestQrCode = createStandardAction(
  "PAYMENT_REQUEST_QR_CODE"
)();

export const paymentQrCode = createStandardAction("PAYMENT_QR_CODE")();

export const paymentRequestManualEntry = createStandardAction(
  "PAYMENT_REQUEST_MANUAL_ENTRY"
)();

export const paymentRequestMessage = createStandardAction(
  "PAYMENT_REQUEST_MESSAGE"
)();

export const paymentManualEntry = createStandardAction(
  "PAYMENT_MANUAL_ENTRY"
)();

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

// For when the user taps on the payment banner and gets redirected
// to the summary of the payment.
export const paymentTransactionSummaryFromRptId = createAction(
  "PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID",
  resolve => (
    rptId: RptId,
    initialAmount: AmountInEuroCents,
    verificaResponse: PaymentRequestsGetResponse
  ) => resolve({ rptId, verificaResponse, initialAmount })
);

export const paymentTransactionSummaryFromBanner = createStandardAction(
  "PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER"
)();

export const paymentRequestContinueWithPaymentMethods = createStandardAction(
  "PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS"
)();

export const paymentRequestPickPaymentMethod = createStandardAction(
  "PAYMENT_REQUEST_PICK_PAYMENT_METHOD"
)();

export const paymentPickPaymentMethod = createStandardAction(
  "PAYMENT_PICK_PAYMENT_METHOD"
)();

export const paymentInitialPickPaymentMethod = createAction(
  "PAYMENT_INITIAL_PICK_PAYMENT_METHOD",
  resolve => (paymentId: string) => resolve(paymentId)
);

export const paymentRequestConfirmPaymentMethod = createAction(
  "PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD",
  resolve => (walletId: number) => resolve(walletId)
);

export const paymentConfirmPaymentMethod = createAction(
  "PAYMENT_CONFIRM_PAYMENT_METHOD",
  resolve => (walletId: number, pspList: ReadonlyArray<Psp>) =>
    resolve({ selectedPaymentMethod: walletId, pspList })
);

export const paymentInitialConfirmPaymentMethod = createAction(
  "PAYMENT_INITIAL_CONFIRM_PAYMENT_METHOD",
  resolve => (
    walletId: number,
    pspList: ReadonlyArray<Psp>,
    paymentId: string
  ) => resolve({ selectedPaymentMethod: walletId, pspList, paymentId })
);

export const paymentRequestPickPsp = createStandardAction(
  "PAYMENT_REQUEST_PICK_PSP"
)();

export const paymentInitialPickPsp = createAction(
  "PAYMENT_INITIAL_PICK_PSP",
  resolve => (
    walletId: number,
    pspList: ReadonlyArray<Psp>,
    paymentId: string
  ) => resolve({ selectedPaymentMethod: walletId, pspList, paymentId })
);

export const paymentPickPsp = createAction(
  "PAYMENT_PICK_PSP",
  resolve => (walletId: number, pspList: ReadonlyArray<Psp>) =>
    resolve({ selectedPaymentMethod: walletId, pspList })
);

export const paymentUpdatePsp = createAction(
  "PAYMENT_UPDATE_PSP",
  resolve => (pspId: number) => resolve(pspId)
);

export const paymentRequestCompletion = createStandardAction(
  "PAYMENT_REQUEST_COMPLETION"
)();

export const paymentGoBack = createStandardAction("PAYMENT_GO_BACK")();

export const paymentRequestGoBack = createStandardAction(
  "PAYMENT_REQUEST_GO_BACK"
)();

export const paymentSetLoadingState = createStandardAction(
  "PAYMENT_SET_LOADING"
)();

export const paymentResetLoadingState = createStandardAction(
  "PAYMENT_RESET_LOADING"
)();

export const paymentCancel = createStandardAction("PAYMENT_CANCEL")();

export const paymentRequestCancel = createStandardAction(
  "PAYMENT_REQUEST_CANCEL"
)();

export const paymentRequestPinLogin = createStandardAction(
  "PAYMENT_REQUEST_PIN_LOGIN"
)();

export const paymentPinLogin = createStandardAction("PAYMENT_PIN_LOGIN")();

export const paymentFailure = createAction(
  "PAYMENT_FAILURE",
  resolve => (error: PagoPaErrors) => resolve(error)
);
