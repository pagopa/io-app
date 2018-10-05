import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { PagoPaErrors } from "../../../types/errors";
import { Psp } from "../../../types/pagopa";

export const resetPaymentState = createStandardAction("PAYMENT_COMPLETED")();

type PaymentUpdatePspInStatePayload = Readonly<{
  walletId: number;
  psp: Psp; // pspId
}>;

// TODO: temporary action until integration with pagoPA occurs
// @https://www.pivotaltracker.com/story/show/159494746
export const paymentUpdatePspInState = createStandardAction(
  "PAYMENT_UPDATE_PSP_IN_STATE"
)<PaymentUpdatePspInStatePayload>();

export const paymentRequestQrCode = createStandardAction(
  "PAYMENT_REQUEST_QR_CODE"
)();

/**
 * Sets the payment state to PaymentStateQrCode, only if previous state is none
 */
export const setPaymentStateToQrCode = createStandardAction(
  "PAYMENT_QR_CODE"
)();

export const paymentRequestManualEntry = createStandardAction(
  "PAYMENT_REQUEST_MANUAL_ENTRY"
)();

export const paymentRequestMessage = createStandardAction(
  "PAYMENT_REQUEST_MESSAGE"
)();

/**
 * Sets the payment state to PaymentStateManualEntry, only if previous state is
 * PaymentStateQrCode.
 */
export const setPaymentStateToManualEntry = createStandardAction(
  "PAYMENT_MANUAL_ENTRY"
)();

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

// For when the user taps on the payment banner and gets redirected
// to the summary of the payment.
export const setPaymentStateToSummary = createAction(
  "PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID",
  resolve => (
    rptId: RptId,
    initialAmount: AmountInEuroCents,
    verificaResponse: PaymentRequestsGetResponse
  ) => resolve({ rptId, verificaResponse, initialAmount })
);

// for when the user taps on the payment banner and gets redirected
// to the summary of the payment
export const setPaymentStateToSummaryWithPaymentId = createStandardAction(
  "PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER"
)();

export const paymentRequestContinueWithPaymentMethods = createStandardAction(
  "PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS"
)();

export const paymentRequestPickPaymentMethod = createStandardAction(
  "PAYMENT_REQUEST_PICK_PAYMENT_METHOD"
)();

export const setPaymentStateToPickPaymentMethod = createStandardAction(
  "PAYMENT_PICK_PAYMENT_METHOD"
)();

export const setPaymentStateFromSummaryToPickPaymentMethod = createStandardAction(
  "PAYMENT_INITIAL_PICK_PAYMENT_METHOD"
)<string>();

export const paymentRequestConfirmPaymentMethod = createStandardAction(
  "PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD"
)<number>();

export const setPaymentStateToConfirmPaymentMethod = createAction(
  "PAYMENT_CONFIRM_PAYMENT_METHOD",
  resolve => (walletId: number, pspList: ReadonlyArray<Psp>) =>
    resolve({ selectedPaymentMethod: walletId, pspList })
);

export const setPaymentStateFromSummaryToConfirmPaymentMethod = createAction(
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

export const setPaymentStateFromSummaryToPickPsp = createAction(
  "PAYMENT_INITIAL_PICK_PSP",
  resolve => (
    walletId: number,
    pspList: ReadonlyArray<Psp>,
    paymentId: string
  ) => resolve({ selectedPaymentMethod: walletId, pspList, paymentId })
);

export const setPaymentStateToPickPsp = createAction(
  "PAYMENT_PICK_PSP",
  resolve => (walletId: number, pspList: ReadonlyArray<Psp>) =>
    resolve({ selectedPaymentMethod: walletId, pspList })
);

export const paymentUpdatePsp = createStandardAction("PAYMENT_UPDATE_PSP")<
  number
>();

export const paymentRequestCompletion = createStandardAction(
  "PAYMENT_REQUEST_COMPLETION"
)();

export const goBackOnePaymentState = createStandardAction("PAYMENT_GO_BACK")();

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

export const setPaymentStateToPinLogin = createStandardAction(
  "PAYMENT_PIN_LOGIN"
)();

export const paymentFailure = createStandardAction("PAYMENT_FAILURE")<
  PagoPaErrors
>();

/**
 * All possible payment actions
 */
export type PaymentActions =
  | ActionType<typeof paymentRequestQrCode>
  | ActionType<typeof setPaymentStateToQrCode>
  | ActionType<typeof paymentRequestManualEntry>
  | ActionType<typeof paymentRequestMessage>
  | ActionType<typeof setPaymentStateToManualEntry>
  | ActionType<typeof paymentRequestTransactionSummaryFromBanner>
  | ActionType<typeof paymentRequestTransactionSummaryFromRptId>
  | ActionType<typeof paymentRequestContinueWithPaymentMethods>
  | ActionType<typeof paymentRequestPickPaymentMethod>
  | ActionType<typeof setPaymentStateToPickPaymentMethod>
  | ActionType<typeof setPaymentStateFromSummaryToPickPaymentMethod>
  | ActionType<typeof paymentRequestConfirmPaymentMethod>
  | ActionType<typeof setPaymentStateToConfirmPaymentMethod>
  | ActionType<typeof setPaymentStateFromSummaryToConfirmPaymentMethod>
  | ActionType<typeof paymentRequestPickPsp>
  | ActionType<typeof setPaymentStateToPickPsp>
  | ActionType<typeof setPaymentStateFromSummaryToPickPsp>
  | ActionType<typeof paymentUpdatePsp>
  | ActionType<typeof paymentUpdatePspInState> // TODO: temporary, until integration with pagoPA occurs @https://www.pivotaltracker.com/story/show/159494746
  | ActionType<typeof paymentRequestCompletion>
  | ActionType<typeof resetPaymentState>
  | ActionType<typeof goBackOnePaymentState>
  | ActionType<typeof paymentRequestGoBack>
  | ActionType<typeof paymentSetLoadingState>
  | ActionType<typeof paymentResetLoadingState>
  | ActionType<typeof paymentCancel>
  | ActionType<typeof paymentRequestCancel>
  | ActionType<typeof paymentRequestPinLogin>
  | ActionType<typeof setPaymentStateToPinLogin>
  | ActionType<typeof paymentFailure>;
