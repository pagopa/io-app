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
  PAYMENT_GO_BACK,
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

export type PaymentStateNoState = Readonly<{
  kind: "PaymentStateNoState";
}>;

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

// Allowed states
export type PaymentStates =
  | PaymentStateNoState
  | PaymentStateQrCode
  | PaymentStateManualEntry
  | PaymentStateSummary
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod;

export type PaymentState = Readonly<{
  stack: ReadonlyArray<PaymentStates>;
}>;

export const PAYMENT_INITIAL_STATE: PaymentState = {
  stack: []
};

// list of states that have a valid
// "verifica" response
export type PaymentStatesWithVerificaResponse =
  | PaymentStateSummary
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod;

export type PaymentStateWithVerificaResponse = Readonly<{
  stack: ReadonlyArray<PaymentStatesWithVerificaResponse>;
}>;

// type guard for *PaymentState*WithVerificaResponse
export const isPaymentStateWithVerificaResponse = (
  state: PaymentState
): state is PaymentStateWithVerificaResponse =>
  state.stack[0].kind === "PaymentStateSummary" ||
  state.stack[0].kind === "PaymentStatePickPaymentMethod" ||
  state.stack[0].kind === "PaymentStateConfirmPaymentMethod";

// type guard for *GlobalState*WithVerificaResponse
export const isGlobalStateWithVerificaResponse = (
  state: GlobalState
): state is GlobalStateWithVerificaResponse =>
  isPaymentStateWithVerificaResponse(state.wallet.payment);

// list of states that have a
// selected payment method
export type PaymentStatesWithSelectedPaymentMethod = PaymentStateConfirmPaymentMethod;

export type PaymentStateWithSelectedPaymentMethod = Readonly<{
  stack: ReadonlyArray<PaymentStatesWithSelectedPaymentMethod>;
}>;

// type guard for *PaymentState*WithSelectedPaymentMethod
export const isPaymentStateWithSelectedPaymentMethod = (
  state: PaymentState
): state is PaymentStateWithSelectedPaymentMethod =>
  state.stack[0].kind === "PaymentStateConfirmPaymentMethod";

// type guard for *GlobalState*WithSelectedPaymentMethod
export const isGlobalStateWithSelectedPaymentMethod = (
  state: GlobalState
): state is GlobalStateWithSelectedPaymentMethod =>
  isPaymentStateWithSelectedPaymentMethod(state.wallet.payment);

/**
 * getPaymentStep returns the current step (i.e. stack[0])
 * If no step is available (clean stack), return a "NoState"
 * value -- that can be typeguarded as needed (kind !==/=== "PaymentStateNoState")
 */
export const getPaymentStep = (state: GlobalState) =>
  state.wallet.payment.stack.length > 0
    ? state.wallet.payment.stack[0].kind
    : { kind: "PaymentStateNoState" };

export const getRptId = (state: GlobalStateWithVerificaResponse): RptId =>
  state.wallet.payment.stack[0].rptId;

export const getInitialAmount = (
  state: GlobalStateWithVerificaResponse
): AmountInEuroCents => state.wallet.payment.stack[0].initialAmount;

export const getSelectedPaymentMethod = (
  state: GlobalStateWithSelectedPaymentMethod
): number => state.wallet.payment.stack[0].selectedPaymentMethod;

export const getCurrentAmount = (
  state: GlobalStateWithVerificaResponse
): AmountInEuroCents =>
  (
    "0".repeat(10) +
    `${state.wallet.payment.stack[0].verificaResponse.importoSingoloVersamento}`
  ).slice(-10) as AmountInEuroCents;

export const getPaymentRecipient = (
  state: GlobalStateWithVerificaResponse
): Option<EnteBeneficiario> =>
  fromNullable(state.wallet.payment.stack[0].verificaResponse.enteBeneficiario);

export const getPaymentReason = (
  state: GlobalStateWithVerificaResponse
): Option<string> =>
  fromNullable(
    state.wallet.payment.stack[0].verificaResponse.causaleVersamento
  );

export const selectedPaymentMethodSelector: (
  state: GlobalStateWithSelectedPaymentMethod
) => Wallet = createSelector(
  (state: GlobalStateWithSelectedPaymentMethod) =>
    some(getSelectedPaymentMethod(state)),
  getWallets,
  (id: Option<number>, wallets: IndexedById<Wallet>): Wallet =>
    getWalletFromId(id, wallets).getOrElse(UNKNOWN_CARD)
);

export const isInAllowedOrigins = (
  state: PaymentState,
  allowed: ReadonlyArray<string>
): boolean =>
  allowed.some(
    a =>
      (a === "none" && state.stack.length === 0) ||
      (state.stack.length > 0 && state.stack[0].kind === a)
  );

export const reducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
): PaymentState => {
  if (
    action.type === PAYMENT_QR_CODE &&
    isInAllowedOrigins(state, ["none", "PaymentStateManualEntry"])
  ) {
    return {
      stack: [
        {
          kind: "PaymentStateQrCode"
        } as PaymentStates
      ].concat(state.stack)
    };
  }
  if (
    action.type === PAYMENT_MANUAL_ENTRY &&
    isInAllowedOrigins(state, ["PaymentStateQrCode"])
  ) {
    return {
      stack: [
        {
          kind: "PaymentStateManualEntry"
        } as PaymentStates
      ].concat(state.stack)
    };
  }
  if (
    action.type === PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID &&
    isInAllowedOrigins(state, ["PaymentStateQrCode", "PaymentStateManualEntry"])
  ) {
    // the summary screen is being requested following
    // a QR code scan/manual entry/message with payment notice
    return {
      stack: [
        {
          kind: "PaymentStateSummary",
          ...action.payload // rptId, verificaResponse, initialAmount
        } as PaymentStates
      ].concat(state.stack)
    };
  }
  if (
    action.type === PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER &&
    isInAllowedOrigins(state, [
      "PaymentStatePickPaymentMethod",
      "PaymentStateConfirmPaymentMethod"
    ])
  ) {
    // payment summary being requested from tapping on the "payment banner"
    // in one of the subsequent screens

    return {
      // pop states until a valid one is reached
      stack: state.stack.reduce(
        (stack: ReadonlyArray<PaymentStates>, s: PaymentStates) =>
          stack.length > 0 || s.kind === "PaymentStateSummary"
            ? stack.concat([s])
            : [],
        []
      )
    };
  }
  if (
    action.type === PAYMENT_PICK_PAYMENT_METHOD &&
    isInAllowedOrigins(state, [
      "PaymentStateSummary",
      "PaymentStateConfirmPaymentMethod"
    ])
  ) {
    const prevState = state.stack[0]; // guaranteed to have 1+ elements (from isInAllowedOrigins)
    if (prevState.kind === "PaymentStateSummary") {
      return {
        stack: [
          {
            ...prevState,
            kind: "PaymentStatePickPaymentMethod"
          } as PaymentStates
        ].concat(state.stack)
      };
    } else if (prevState.kind === "PaymentStateConfirmPaymentMethod") {
      // if it's coming from an already-selected-payment-method state,
      // drop the selected method
      const { selectedPaymentMethod, ...rest } = prevState;
      return {
        stack: [
          {
            ...rest,
            kind: "PaymentStatePickPaymentMethod"
          } as PaymentStates
        ].concat(state.stack)
      };
    }
  }
  if (
    action.type === PAYMENT_CONFIRM_PAYMENT_METHOD &&
    isInAllowedOrigins(state, [
      "PaymentStatePickPaymentMethod",
      "PaymentStateSummary"
    ])
  ) {
    return {
      stack: [
        {
          ...state.stack[0],
          kind: "PaymentStateConfirmPaymentMethod",
          selectedPaymentMethod: action.payload
        } as PaymentStates
      ].concat(state.stack)
    };
  }
  if (
    action.type === PAYMENT_COMPLETED &&
    isInAllowedOrigins(state, ["PaymentStateConfirmPaymentMethod"])
  ) {
    return {
      stack: [] // cleaning up
    };
  }
  if (action.type === PAYMENT_GO_BACK) {
    // pop 1 step
    // ([].slice(1) -> [])
    return {
      stack: state.stack.slice(1)
    };
  }
  return state;
};

export default reducer;
