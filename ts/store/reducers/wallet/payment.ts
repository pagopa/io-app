/**
 * Reducer, available states and selectors for the "payment" state
 */
import { fromNullable, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { createSelector } from "reselect";
import { CodiceContestoPagamento } from "../../../../definitions/backend/CodiceContestoPagamento";
import { EnteBeneficiario } from "../../../../definitions/backend/EnteBeneficiario";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Psp, Wallet } from "../../../types/pagopa";
import { UNKNOWN_CARD } from "../../../types/unknown";
import {
  PAYMENT_COMPLETED,
  PAYMENT_CONFIRM_PAYMENT_METHOD,
  PAYMENT_GO_BACK,
  PAYMENT_INITIAL_CONFIRM_PAYMENT_METHOD,
  PAYMENT_INITIAL_PICK_PAYMENT_METHOD,
  PAYMENT_INITIAL_PICK_PSP,
  PAYMENT_MANUAL_ENTRY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_PICK_PSP,
  PAYMENT_QR_CODE,
  PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER,
  PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { IndexedById } from "../../helpers/indexer";
import {
  GlobalState,
  GlobalStateWithPaymentId,
  GlobalStateWithSelectedPaymentMethod,
  GlobalStateWithVerificaResponse
} from "../types";
import { getWalletFromId, getWallets } from "./wallets";
import { AmountToImporto } from "../../../utils/amounts";

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

// state for showing the summary when the "attiva"
// operation has already been carried out (so the
// paymentId is already available)
export type PaymentStateSummaryWithPaymentId = Readonly<{
  kind: "PaymentStateSummaryWithPaymentId";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  paymentId: string;
}>;

export type PaymentStatePickPaymentMethod = Readonly<{
  kind: "PaymentStatePickPaymentMethod";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  paymentId: string;
}>;

export type PaymentStateConfirmPaymentMethod = Readonly<{
  kind: "PaymentStateConfirmPaymentMethod";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  selectedPaymentMethod: number;
  pspList: ReadonlyArray<Psp>;
  paymentId: string;
}>;

export type PaymentStatePickPsp = Readonly<{
  kind: "PaymentStatePickPsp";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  selectedPaymentMethod: number;
  pspList: ReadonlyArray<Psp>;
  paymentId: string;
}>;

// Allowed states
export type PaymentStates =
  | PaymentStateNoState
  | PaymentStateQrCode
  | PaymentStateManualEntry
  | PaymentStateSummary
  | PaymentStateSummaryWithPaymentId
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod
  | PaymentStatePickPsp;

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
  | PaymentStateSummaryWithPaymentId
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod
  | PaymentStatePickPsp;

export type PaymentStateWithVerificaResponse = Readonly<{
  stack: ReadonlyArray<PaymentStatesWithVerificaResponse>;
}>;

// type guard for *PaymentState*WithVerificaResponse
export const isPaymentStateWithVerificaResponse = (
  state: PaymentState
): state is PaymentStateWithVerificaResponse =>
  state.stack[0].kind === "PaymentStateSummary" ||
  state.stack[0].kind === "PaymentStateSummaryWithPaymentId" ||
  state.stack[0].kind === "PaymentStatePickPaymentMethod" ||
  state.stack[0].kind === "PaymentStateConfirmPaymentMethod" ||
  state.stack[0].kind === "PaymentStatePickPsp";

// type guard for *GlobalState*WithVerificaResponse
export const isGlobalStateWithVerificaResponse = (
  state: GlobalState
): state is GlobalStateWithVerificaResponse =>
  isPaymentStateWithVerificaResponse(state.wallet.payment);

export type PaymentStatesWithPaymentId =
  | PaymentStateSummaryWithPaymentId
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod
  | PaymentStatePickPsp;

export type PaymentStateWithPaymentId = Readonly<{
  stack: ReadonlyArray<PaymentStatesWithPaymentId>;
}>;

// type guard for *PaymentState*WithVerificaResponse
export const isPaymentStateWithPaymentId = (
  state: PaymentState
): state is PaymentStateWithPaymentId =>
  state.stack[0].kind === "PaymentStateSummaryWithPaymentId" ||
  state.stack[0].kind === "PaymentStatePickPaymentMethod" ||
  state.stack[0].kind === "PaymentStateConfirmPaymentMethod" ||
  state.stack[0].kind === "PaymentStatePickPsp";

// type guard for *GlobalState*WithPaymentId
export const isGlobalStateWithPaymentId = (
  state: GlobalState
): state is GlobalStateWithPaymentId =>
  isPaymentStateWithPaymentId(state.wallet.payment);

// list of states that have a
// selected payment method
export type PaymentStatesWithSelectedPaymentMethod =
  | PaymentStateConfirmPaymentMethod
  | PaymentStatePickPsp;

export type PaymentStateWithSelectedPaymentMethod = Readonly<{
  stack: ReadonlyArray<PaymentStatesWithSelectedPaymentMethod>;
}>;

// type guard for *PaymentState*WithSelectedPaymentMethod
export const isPaymentStateWithSelectedPaymentMethod = (
  state: PaymentState
): state is PaymentStateWithSelectedPaymentMethod =>
  state.stack[0].kind === "PaymentStateConfirmPaymentMethod" ||
  state.stack[0].kind === "PaymentStatePickPsp";

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

export const getPaymentContextCode = (
  state: GlobalStateWithVerificaResponse
): CodiceContestoPagamento =>
  state.wallet.payment.stack[0].verificaResponse.codiceContestoPagamento;

export const getInitialAmount = (
  state: GlobalStateWithVerificaResponse
): AmountInEuroCents => state.wallet.payment.stack[0].initialAmount;

export const getSelectedPaymentMethod = (
  state: GlobalStateWithSelectedPaymentMethod
): number => state.wallet.payment.stack[0].selectedPaymentMethod;

export const getCurrentAmount = (
  state: GlobalStateWithVerificaResponse
): AmountInEuroCents =>
  AmountToImporto.encode(
    state.wallet.payment.stack[0].verificaResponse.importoSingoloVersamento
  );

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

export const getPspList = (
  state: GlobalStateWithSelectedPaymentMethod
): ReadonlyArray<Psp> => state.wallet.payment.stack[0].pspList;

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

export const popUntil = (
  stack: ReadonlyArray<PaymentStates>,
  until: ReadonlyArray<string>
): ReadonlyArray<PaymentStates> =>
  stack.reduce(
    (a: ReadonlyArray<PaymentStates>, b: PaymentStates) =>
      a.length > 0 || until.some(u => u === b.kind) ? a.concat([b]) : [],
    []
  );

// used to replicate the behavior of
// the navigator (i.e. when visiting
// an already available screen, move
// use that one without generating a new
// one (and pop screens required to get there)
// This makes sure that the state does not
// grow indefinitely when looping through
// the payment process
export const popToStateAndPush = (
  stack: ReadonlyArray<PaymentStates>,
  state: PaymentStates,
  until: ReadonlyArray<string>
) =>
  [state].concat(
    stack.some(s => until.some(u => u === s.kind))
      ? popUntil(stack, until).slice(1)
      : stack
  );

type PaymentReducer = (state: PaymentState, action: Action) => PaymentState;
/**
 * Reducer for actions for entering data (qr code, manual entry)
 */
const dataEntryReducer: PaymentReducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
) => {
  if (action.type === PAYMENT_QR_CODE && isInAllowedOrigins(state, ["none"])) {
    return {
      stack: popToStateAndPush(
        state.stack,
        {
          kind: "PaymentStateQrCode"
        },
        ["PaymentStateQrCode"]
      )
    };
  }
  if (
    action.type === PAYMENT_MANUAL_ENTRY &&
    isInAllowedOrigins(state, ["PaymentStateQrCode"])
  ) {
    return {
      stack: popToStateAndPush(
        state.stack,
        {
          kind: "PaymentStateManualEntry"
        },
        ["PaymentStateManualEntry"]
      )
    };
  }
  return state;
};

/**
 * Reducer for actions that show the payment summary
 */
const summaryReducer: PaymentReducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
) => {
  if (
    action.type === PAYMENT_TRANSACTION_SUMMARY_FROM_RPT_ID &&
    isInAllowedOrigins(state, [
      "PaymentStateQrCode",
      "PaymentStateManualEntry",
      "none"
    ])
  ) {
    // the summary screen is being requested following
    // a QR code scan/manual entry/message with payment notice
    return {
      stack: popToStateAndPush(
        state.stack,
        {
          kind: "PaymentStateSummary",
          ...action.payload // rptId, verificaResponse, initialAmount
        },
        ["PaymentStateSummary"]
      )
    };
  }
  if (
    action.type === PAYMENT_TRANSACTION_SUMMARY_FROM_BANNER &&
    isInAllowedOrigins(state, [
      "PaymentStatePickPaymentMethod",
      "PaymentStateConfirmPaymentMethod",
      "PaymentStatePickPsp"
    ]) &&
    isPaymentStateWithPaymentId(state)
  ) {
    // payment summary being requested from tapping on the "payment banner"
    // in one of the subsequent screens
    const prevState = state.stack[0];

    return {
      // pop states until a valid one is reached
      stack: popToStateAndPush(
        state.stack,
        {
          kind: "PaymentStateSummaryWithPaymentId",
          rptId: prevState.rptId,
          verificaResponse: prevState.verificaResponse,
          initialAmount: prevState.initialAmount,
          paymentId: prevState.paymentId
        },
        ["PaymentStateSummaryWithPaymentId", "PaymentStateSummary"]
      )
    };
  }
  return state;
};

/**
 * Reducer for actions that show the list of payment methods
 */
const pickMethodReducer: PaymentReducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
) => {
  if (
    action.type === PAYMENT_INITIAL_PICK_PAYMENT_METHOD &&
    isInAllowedOrigins(state, [
      "PaymentStateSummary"
      // "PaymentStateSummaryWithPaymentId",
      // "PaymentStateConfirmPaymentMethod"
    ]) &&
    isPaymentStateWithVerificaResponse(state)
  ) {
    // comes from the initial payment summary, so the
    // action will contain a paymentId to be stored
    const prevState = state.stack[0];
    return {
      stack: popToStateAndPush(
        state.stack,
        {
          rptId: prevState.rptId,
          verificaResponse: prevState.verificaResponse,
          initialAmount: prevState.initialAmount,
          paymentId: action.payload,
          kind: "PaymentStatePickPaymentMethod"
        },
        ["PaymentStatePickPaymentMethod"]
      )
    };
  }
  if (
    action.type === PAYMENT_PICK_PAYMENT_METHOD &&
    isInAllowedOrigins(state, [
      "PaymentStateSummaryWithPaymentId",
      "PaymentStateConfirmPaymentMethod"
    ]) &&
    isPaymentStateWithPaymentId(state)
  ) {
    const prevState = state.stack[0];
    return {
      stack: popToStateAndPush(
        state.stack,
        {
          kind: "PaymentStatePickPaymentMethod",
          rptId: prevState.rptId,
          verificaResponse: prevState.verificaResponse,
          initialAmount: prevState.initialAmount,
          paymentId: prevState.paymentId
        },
        ["PaymentStatePickPaymentMethod"]
      )
    };
  }
  return state;
};

/**
 * Reducer for actions that select a payment method
 */
const confirmMethodReducer: PaymentReducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
) => {
  if (
    action.type === PAYMENT_INITIAL_CONFIRM_PAYMENT_METHOD &&
    isInAllowedOrigins(state, ["PaymentStateSummary"]) &&
    isPaymentStateWithVerificaResponse(state)
  ) {
    return {
      stack: popToStateAndPush(
        state.stack,
        {
          ...state.stack[0],
          ...action.payload,
          kind: "PaymentStateConfirmPaymentMethod"
        },
        ["PaymentStateConfirmPaymentMethod"]
      )
    };
  }
  if (
    action.type === PAYMENT_CONFIRM_PAYMENT_METHOD &&
    isInAllowedOrigins(state, [
      "PaymentStatePickPaymentMethod",
      "PaymentStateSummaryWithPaymentId",
      "PaymentStatePickPsp"
    ]) &&
    isPaymentStateWithPaymentId(state)
  ) {
    return {
      stack: popToStateAndPush(
        state.stack,
        {
          ...state.stack[0],
          ...action.payload,
          kind: "PaymentStateConfirmPaymentMethod"
        },
        ["PaymentStateConfirmPaymentMethod"]
      )
    };
  }
  return state;
};

/**
 * Reducer for actions that show a list of PSPs available
 */
const pickPspReducer: PaymentReducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
) => {
  if (
    action.type === PAYMENT_INITIAL_PICK_PSP &&
    isInAllowedOrigins(state, ["PaymentStateSummary"]) &&
    isPaymentStateWithVerificaResponse(state)
  ) {
    return {
      stack: popToStateAndPush(
        state.stack,
        {
          ...state.stack[0],
          ...action.payload,
          kind: "PaymentStatePickPsp"
        },
        ["PaymentStatePickPsp"]
      )
    };
  }
  if (
    action.type === PAYMENT_PICK_PSP &&
    isInAllowedOrigins(state, [
      "PaymentStateSummaryWithPaymentId",
      "PaymentStateConfirmPaymentMethod",
      "PaymentStatePickPaymentMethod"
    ]) &&
    isPaymentStateWithPaymentId(state)
  ) {
    return {
      stack: popToStateAndPush(
        state.stack,
        {
          ...state.stack[0],
          ...action.payload,
          kind: "PaymentStatePickPsp"
        },
        ["PaymentStatePickPsp"]
      )
    };
  }
  return state;
};

/**
 * Reducer for going back in the stack of payment steps
 */
const goBackReducer: PaymentReducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
) => {
  if (action.type === PAYMENT_GO_BACK) {
    // if going back means going to the "initial" summary screen
    // (i.e. where the "attiva" is done and the payment id is fetched,
    // return to a state that also has the payment Id

    // pop 1 step
    // ([].slice(1) -> [])
    const newStack = state.stack.slice(1);
    if (
      newStack.length > 0 &&
      isPaymentStateWithPaymentId(state) &&
      newStack[0].kind === "PaymentStateSummary"
    ) {
      const prevState = state.stack[0];

      return {
        stack: ([
          {
            kind: "PaymentStateSummaryWithPaymentId",
            verificaResponse: prevState.verificaResponse,
            rptId: prevState.rptId,
            paymentId: prevState.paymentId,
            initialAmount: prevState.initialAmount
          }
        ] as ReadonlyArray<PaymentStates>).concat(newStack.slice(1))
      };
    }
    return {
      stack: newStack
    };
  }
  return state;
};

/**
 * Reducer for actions that terminate a payment
 */
const endPaymentReducer: PaymentReducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
) => {
  if (
    action.type === PAYMENT_COMPLETED &&
    isInAllowedOrigins(state, ["PaymentStateConfirmPaymentMethod"])
  ) {
    return {
      stack: [] // cleaning up
    };
  }
  return state;
};

const reducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
): PaymentState => {
  const reducers: ReadonlyArray<PaymentReducer> = [
    dataEntryReducer,
    summaryReducer,
    pickMethodReducer,
    confirmMethodReducer,
    pickPspReducer,
    goBackReducer,
    endPaymentReducer
  ];
  return reducers.reduce(
    (s: PaymentState, r: PaymentReducer) => r(s, action),
    state
  );
};

export default reducer;
