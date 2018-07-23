/**
 * Reducer, available states and selectors for the "payment" state
 */
import { fromNullable, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { createSelector } from "reselect";
import { EnteBeneficiario } from "../../../../definitions/backend/EnteBeneficiario";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Wallet } from "../../../../definitions/pagopa/Wallet";
import { UNKNOWN_CARD } from "../../../types/unknown";
import {
  PAYMENT_COMPLETED,
  PAYMENT_CONFIRM_PAYMENT_METHOD,
  PAYMENT_MANUAL_ENTRY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_QR_CODE,
  PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER,
  PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { IndexedById } from "../../helpers/indexer";
import {
  GlobalState,
  GlobalStateWithSelectedPaymentMethod,
  GlobalStateWithVerificaResponse
} from "../types";
import { getWalletFromId, getWallets } from "./wallets";

// The following are possible states, identified
// by a string (kind), and with specific
// properties depending on the state

export type PaymentStateQrCode = Readonly<{
  kind: "PaymentStateQrCode";
}>;

export type PaymentStateManualEntry = Readonly<{
  kind: "PaymentStateManualEntry";
}>;

export type PaymentStateSummary = Readonly<{
  kind: "PaymentStateSummary";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
}>;

export type PaymentStatePickPaymentMethod = Readonly<{
  kind: "PaymentStatePickPaymentMethod";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
}>;

export type PaymentStateConfirmPaymentMethod = Readonly<{
  kind: "PaymentStateConfirmPaymentMethod";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  selectedPaymentMethod: number;
}>;

export type PaymentStateCompleted = Readonly<{
  kind: "PaymentStateCompleted";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  selectedPaymentMethod: number;
}>;

// Allowed states
export type PaymentState =
  | PaymentStateQrCode
  | PaymentStateManualEntry
  | PaymentStateSummary
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod
  | PaymentStateCompleted;

export const PAYMENT_INITIAL_STATE: PaymentState = {
  kind: "PaymentStateQrCode"
};

// list of states that have a valid
// "verifica" response
export type PaymentStateWithVerificaResponse =
  | PaymentStateSummary
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod
  | PaymentStateCompleted;

// type guard for *PaymentState*WithVerificaResponse
export const isPaymentStateWithVerificaResponse = (
  state: PaymentState
): state is PaymentStateWithVerificaResponse =>
  state.kind === "PaymentStateSummary" ||
  state.kind === "PaymentStatePickPaymentMethod" ||
  state.kind === "PaymentStateConfirmPaymentMethod" ||
  state.kind === "PaymentStateCompleted";

// type guard for *GlobalState*WithVerificaResponse
export const isGlobalStateWithVerificaResponse = (
  state: GlobalState
): state is GlobalStateWithVerificaResponse =>
  isPaymentStateWithVerificaResponse(state.wallet.payment);

// list of states that have a
// selected payment method
export type PaymentStateWithSelectedPaymentMethod =
  | PaymentStateConfirmPaymentMethod
  | PaymentStateCompleted;

// type guard for *PaymentState*WithSelectedPaymentMethod
export const isPaymentStateWithSelectedPaymentMethod = (
  state: PaymentState
): state is PaymentStateWithSelectedPaymentMethod =>
  state.kind === "PaymentStateConfirmPaymentMethod" ||
  state.kind === "PaymentStateCompleted";

// type guard for *GlobalState*WithSelectedPaymentMethod
export const isGlobalStateWithSelectedPaymentMethod = (
  state: GlobalState
): state is GlobalStateWithSelectedPaymentMethod =>
  isPaymentStateWithSelectedPaymentMethod(state.wallet.payment);

export const getPaymentStep = (state: GlobalState) => state.wallet.payment.kind;

export const getRptId = (state: GlobalStateWithVerificaResponse): RptId =>
  state.wallet.payment.rptId;

export const getInitialAmount = (
  state: GlobalStateWithVerificaResponse
): AmountInEuroCents => state.wallet.payment.initialAmount;

export const getSelectedPaymentMethod = (
  state: GlobalStateWithSelectedPaymentMethod
): number => state.wallet.payment.selectedPaymentMethod;

export const getCurrentAmount = (
  state: GlobalStateWithVerificaResponse
): AmountInEuroCents =>
  (
    "0".repeat(10) +
    `${state.wallet.payment.verificaResponse.importoSingoloVersamento}`
  ).slice(-10) as AmountInEuroCents;

export const getPaymentRecipient = (
  state: GlobalStateWithVerificaResponse
): Option<EnteBeneficiario> =>
  fromNullable(state.wallet.payment.verificaResponse.enteBeneficiario);

export const getPaymentReason = (
  state: GlobalStateWithVerificaResponse
): Option<string> =>
  fromNullable(state.wallet.payment.verificaResponse.causaleVersamento);

export const selectedPaymentMethodSelector: (
  state: GlobalStateWithSelectedPaymentMethod
) => Wallet = createSelector(
  (state: GlobalStateWithSelectedPaymentMethod) =>
    some(getSelectedPaymentMethod(state)),
  getWallets,
  (id: Option<number>, wallets: IndexedById<Wallet>): Wallet =>
    getWalletFromId(id, wallets).getOrElse(UNKNOWN_CARD)
);

export const reducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
): PaymentState => {
  if (action.type === PAYMENT_QR_CODE) {
    return {
      kind: "PaymentStateQrCode"
    };
  }
  if (action.type === PAYMENT_MANUAL_ENTRY) {
    return {
      kind: "PaymentStateManualEntry"
    };
  }
  if (action.type === PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID) {
    // the summary screen is being requested following
    // a QR code scan/manual entry/message with payment notice
    return {
      kind: "PaymentStateSummary",
      ...action.payload // rptId, verificaResponse, initialAmount
    };
  }
  if (
    action.type === PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER &&
    isPaymentStateWithVerificaResponse(state)
  ) {
    // payment summary being requested from tapping on the "payment banner"
    // in one of the subsequent screens

    if (isPaymentStateWithSelectedPaymentMethod(state)) {
      // a payment method has already been selected -- it is
      // discarded so as to build a valid "summary" state
      const { selectedPaymentMethod, ...rest } = state;
      return {
        ...rest,
        kind: "PaymentStateSummary"
      };
    } else {
      return {
        ...state,
        kind: "PaymentStateSummary"
      };
    }
  }
  if (
    action.type === PAYMENT_PICK_PAYMENT_METHOD &&
    isPaymentStateWithVerificaResponse(state)
  ) {
    // if the user is getting here from the "confirm payment
    // method" screen, the previous state contains an already-
    // selected payment method, which is discarded here
    if (isPaymentStateWithSelectedPaymentMethod(state)) {
      const { selectedPaymentMethod, ...rest } = state;
      return {
        ...rest,
        kind: "PaymentStatePickPaymentMethod"
      };
    } else {
      return {
        ...(state as PaymentStatePickPaymentMethod),
        kind: "PaymentStatePickPaymentMethod"
      };
    }
  }
  if (
    action.type === PAYMENT_CONFIRM_PAYMENT_METHOD &&
    isPaymentStateWithVerificaResponse(state)
  ) {
    return {
      ...state,
      kind: "PaymentStateConfirmPaymentMethod",
      selectedPaymentMethod: action.payload
    };
  }
  if (
    action.type === PAYMENT_COMPLETED &&
    isPaymentStateWithSelectedPaymentMethod(state)
  ) {
    return {
      ...state,
      kind: "PaymentStateCompleted"
    };
  }
  return state;
};

export default reducer;
