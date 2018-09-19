/**
 * Reducer, available states and selectors for the "payment" state
 */
import {
  fromArray as toNonEmptyArray,
  NonEmptyArray
} from "fp-ts/lib/NonEmptyArray";
import { fromNullable, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { createSelector } from "reselect";
import { CodiceContestoPagamento } from "../../../../definitions/backend/CodiceContestoPagamento";
import { EnteBeneficiario } from "../../../../definitions/backend/EnteBeneficiario";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Psp, Wallet } from "../../../types/pagopa";
import { UNKNOWN_CARD } from "../../../types/unknown";
import { AmountToImporto } from "../../../utils/amounts";
import {
  PAYMENT_CANCEL,
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
import { WalletStateWithVerificaResponse } from "./../../reducers/wallet";
import { WalletState } from "./index";
import { getWalletFromId, getWallets } from "./wallets";

// The following are possible states, identified
// by a string (kind), and with specific
// properties depending on the state

type PaymentStateNoState = Readonly<{
  kind: "PaymentStateNoState";
}>;

type PaymentStateQrCode = Readonly<{
  kind: "PaymentStateQrCode";
}>;

type PaymentStateManualEntry = Readonly<{
  kind: "PaymentStateManualEntry";
}>;

type PaymentStateSummary = Readonly<{
  kind: "PaymentStateSummary";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
}>;

// state for showing the summary when the "attiva"
// operation has already been carried out (so the
// paymentId is already available)
type PaymentStateSummaryWithPaymentId = Readonly<{
  kind: "PaymentStateSummaryWithPaymentId";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  paymentId: string;
}>;

type PaymentStatePickPaymentMethod = Readonly<{
  kind: "PaymentStatePickPaymentMethod";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  paymentId: string;
}>;

type PaymentStateConfirmPaymentMethod = Readonly<{
  kind: "PaymentStateConfirmPaymentMethod";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  selectedPaymentMethod: number;
  pspList: ReadonlyArray<Psp>;
  paymentId: string;
}>;

type PaymentStatePickPsp = Readonly<{
  kind: "PaymentStatePickPsp";
  rptId: RptId;
  verificaResponse: PaymentRequestsGetResponse;
  initialAmount: AmountInEuroCents;
  selectedPaymentMethod: number;
  pspList: ReadonlyArray<Psp>;
  paymentId: string;
}>;

// Allowed states
type PaymentStates =
  | PaymentStateNoState
  | PaymentStateQrCode
  | PaymentStateManualEntry
  | PaymentStateSummary
  | PaymentStateSummaryWithPaymentId
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod
  | PaymentStatePickPsp;

export type PaymentState = Readonly<{
  stack: NonEmptyArray<PaymentStates> | null;
}>;

const PAYMENT_INITIAL_STATE: PaymentState = {
  stack: null
};

// list of states that have a valid
// "verifica" response
type PaymentStatesWithVerificaResponse =
  | PaymentStateSummary
  | PaymentStateSummaryWithPaymentId
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod
  | PaymentStatePickPsp;

export type PaymentStateWithVerificaResponse = Readonly<{
  stack: NonEmptyArray<PaymentStatesWithVerificaResponse>;
}>;

export const isPaymentStarted = (
  wallet: WalletState
): wallet is WalletStateWithVerificaResponse => wallet.payment.stack !== null;

// type guard for *PaymentState*WithVerificaResponse
const isPaymentStateWithVerificaResponse = (
  state: PaymentState
): state is PaymentStateWithVerificaResponse =>
  state.stack !== null &&
  (state.stack.head.kind === "PaymentStateSummary" ||
    state.stack.head.kind === "PaymentStateSummaryWithPaymentId" ||
    state.stack.head.kind === "PaymentStatePickPaymentMethod" ||
    state.stack.head.kind === "PaymentStateConfirmPaymentMethod" ||
    state.stack.head.kind === "PaymentStatePickPsp");

// type guard for *GlobalState*WithVerificaResponse
export const isGlobalStateWithVerificaResponse = (
  state: GlobalState
): state is GlobalStateWithVerificaResponse =>
  isPaymentStateWithVerificaResponse(state.wallet.payment);

type PaymentStatesWithPaymentId =
  | PaymentStateSummaryWithPaymentId
  | PaymentStatePickPaymentMethod
  | PaymentStateConfirmPaymentMethod
  | PaymentStatePickPsp;

export type PaymentStateWithPaymentId = Readonly<{
  stack: NonEmptyArray<PaymentStatesWithPaymentId>;
}>;

// type guard for *PaymentState*WithVerificaResponse
const isPaymentStateWithPaymentId = (
  state: PaymentState
): state is PaymentStateWithPaymentId =>
  state.stack !== null &&
  (state.stack.head.kind === "PaymentStateSummaryWithPaymentId" ||
    state.stack.head.kind === "PaymentStatePickPaymentMethod" ||
    state.stack.head.kind === "PaymentStateConfirmPaymentMethod" ||
    state.stack.head.kind === "PaymentStatePickPsp");

// type guard for *GlobalState*WithPaymentId
export const isGlobalStateWithPaymentId = (
  state: GlobalState
): state is GlobalStateWithPaymentId =>
  isPaymentStateWithPaymentId(state.wallet.payment);

// list of states that have a
// selected payment method
type PaymentStatesWithSelectedPaymentMethod =
  | PaymentStateConfirmPaymentMethod
  | PaymentStatePickPsp;

export type PaymentStateWithSelectedPaymentMethod = Readonly<{
  stack: NonEmptyArray<PaymentStatesWithSelectedPaymentMethod>;
}>;

// type guard for *PaymentState*WithSelectedPaymentMethod
const isPaymentStateWithSelectedPaymentMethod = (
  state: PaymentState
): state is PaymentStateWithSelectedPaymentMethod =>
  state.stack !== null &&
  (state.stack.head.kind === "PaymentStateConfirmPaymentMethod" ||
    state.stack.head.kind === "PaymentStatePickPsp");

// type guard for *GlobalState*WithSelectedPaymentMethod
export const isGlobalStateWithSelectedPaymentMethod = (
  state: GlobalState
): state is GlobalStateWithSelectedPaymentMethod =>
  isPaymentStateWithSelectedPaymentMethod(state.wallet.payment);

/**
 * getPaymentStep returns the current step (i.e. stack.head)
 * If no step is available (clean stack), return a "NoState"
 * value -- that can be typeguarded as needed (kind !==/=== "PaymentStateNoState")
 */
export const getPaymentStep = (state: GlobalState) =>
  state.wallet.payment.stack !== null
    ? state.wallet.payment.stack.head.kind
    : { kind: "PaymentStateNoState" };

export const getRptId = (state: GlobalStateWithVerificaResponse): RptId =>
  state.wallet.payment.stack.head.rptId;

export const getPaymentContextCode = (
  state: GlobalStateWithVerificaResponse
): CodiceContestoPagamento =>
  state.wallet.payment.stack.head.verificaResponse.codiceContestoPagamento;

export const getInitialAmount = (
  state: GlobalStateWithVerificaResponse
): AmountInEuroCents => state.wallet.payment.stack.head.initialAmount;

export const getSelectedPaymentMethod = (
  state: GlobalStateWithSelectedPaymentMethod
): number => state.wallet.payment.stack.head.selectedPaymentMethod;

export const getCurrentAmount = (
  state: GlobalStateWithVerificaResponse
): AmountInEuroCents =>
  AmountToImporto.encode(
    state.wallet.payment.stack.head.verificaResponse.importoSingoloVersamento
  );

export const getPaymentRecipient = (
  state: GlobalStateWithVerificaResponse
): Option<EnteBeneficiario> =>
  fromNullable(
    state.wallet.payment.stack.head.verificaResponse.enteBeneficiario
  );

export const getPaymentReason = (
  state: GlobalStateWithVerificaResponse
): Option<string> =>
  fromNullable(
    state.wallet.payment.stack.head.verificaResponse.causaleVersamento
  );

export const getPspList = (
  state: GlobalStateWithSelectedPaymentMethod
): ReadonlyArray<Psp> => state.wallet.payment.stack.head.pspList;

export const getPaymentId = (state: GlobalStateWithPaymentId): string =>
  state.wallet.payment.stack.head.paymentId;

export const selectedPaymentMethodSelector: (
  state: GlobalStateWithSelectedPaymentMethod
) => Wallet = createSelector(
  (state: GlobalStateWithSelectedPaymentMethod) =>
    some(getSelectedPaymentMethod(state)),
  getWallets,
  (id: Option<number>, wallets: IndexedById<Wallet>): Wallet =>
    getWalletFromId(id, wallets).getOrElse(UNKNOWN_CARD)
);

const isInAllowedOrigins = (
  state: PaymentState,
  allowed: ReadonlyArray<string>
): boolean =>
  allowed.some(
    a =>
      (state.stack === null && a === "none") ||
      (state.stack !== null && state.stack.head.kind === a)
  );

const popUntil = (
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
const popToStateAndPush = (
  stack: PaymentState["stack"],
  state: PaymentStates,
  until: ReadonlyArray<string>
): NonEmptyArray<PaymentStates> => {
  if (stack === null) {
    // stack is empty
    return new NonEmptyArray(state, []);
  }
  const shouldClean = stack.toArray().some(s => until.some(u => u === s.kind));
  const cleanedStack = shouldClean
    ? popUntil(stack.toArray(), until).slice(1)
    : stack.toArray();
  return new NonEmptyArray(state, cleanedStack);
};

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
    const prevState = state.stack.head;

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
    const prevState = state.stack.head;
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
    const prevState = state.stack.head;
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
          ...state.stack.head,
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
          ...state.stack.head,
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
          ...state.stack.head,
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
          ...state.stack.head,
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
    const newStack =
      state.stack === null
        ? null
        : toNonEmptyArray(state.stack.tail).toNullable();

    if (
      newStack !== null &&
      isPaymentStateWithPaymentId(state) &&
      newStack.head.kind === "PaymentStateSummary"
    ) {
      const prevState = state.stack.head;

      return {
        stack: new NonEmptyArray(
          {
            kind: "PaymentStateSummaryWithPaymentId",
            verificaResponse: prevState.verificaResponse,
            rptId: prevState.rptId,
            paymentId: prevState.paymentId,
            initialAmount: prevState.initialAmount
          },
          newStack.tail
        )
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
      stack: null // cleaning up
    };
  }
  return state;
};

/**
 * Reducer for actions that cancel a payment
 */
const cancelPaymentReducer: PaymentReducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
) => {
  if (action.type === PAYMENT_CANCEL) {
    return {
      stack: null // cleaning up
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
    cancelPaymentReducer,
    endPaymentReducer
  ];
  return reducers.reduce(
    (s: PaymentState, r: PaymentReducer) => r(s, action),
    state
  );
};

export default reducer;
