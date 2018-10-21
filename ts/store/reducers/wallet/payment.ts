import { getType } from "typesafe-actions";
import { PaymentActivationsPostResponse } from "../../../../definitions/backend/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Psp, Transaction } from "../../../types/pagopa";
import * as pot from "../../../types/pot";
import { Action } from "../../actions/types";
import {
  paymentAttivaFailure,
  paymentAttivaRequest,
  paymentAttivaSuccess,
  paymentCheckFailure,
  paymentCheckRequest,
  paymentCheckSuccess,
  paymentExecutePaymentFailure,
  paymentExecutePaymentRequest,
  paymentExecutePaymentSuccess,
  paymentFetchPspsForPaymentIdFailure,
  paymentFetchPspsForPaymentIdRequest,
  paymentFetchPspsForPaymentIdSuccess,
  paymentIdPollingFailure,
  paymentIdPollingRequest,
  paymentIdPollingSuccess,
  paymentInitializeState,
  paymentVerificaFailure,
  paymentVerificaRequest,
  paymentVerificaSuccess
} from "../../actions/wallet/payment";
import { GlobalState } from "../types";

// TODO: instead of keeping one single state, it would me more correct to keep
//       a state for each rptid - this will make unnecessary to reset the state
//       at the beginning of a new payment flow.
export type PaymentState = Readonly<{
  verifica: pot.Pot<PaymentRequestsGetResponse>;
  attiva: pot.Pot<PaymentActivationsPostResponse>;
  paymentId: pot.Pot<string>;
  check: pot.Pot<true>;
  psps: pot.Pot<ReadonlyArray<Psp>>;
  transaction: pot.Pot<Transaction>;
}>;

/**
 * Returns the payment ID if one has been fetched so far
 */
const getPaymentIdFromGlobalState = (state: GlobalState) =>
  pot.toOption(state.wallet.payment.paymentId);

export const isPaymentOngoingSelector = (state: GlobalState) =>
  getPaymentIdFromGlobalState(state).isSome();

const PAYMENT_INITIAL_STATE: PaymentState = {
  verifica: pot.none,
  attiva: pot.none,
  paymentId: pot.none,
  check: pot.none,
  psps: pot.none,
  transaction: pot.none
};

/**
 * Reducer for actions that show the payment summary
 */
const reducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
): PaymentState => {
  switch (action.type) {
    case getType(paymentInitializeState):
      return PAYMENT_INITIAL_STATE;

    //
    // verifica
    //
    case getType(paymentVerificaRequest):
      return {
        // a verifica operation will generate a new codice contesto pagamento
        // effectively starting a new payment session, thus we also invalidate
        // the rest of the payment state
        ...PAYMENT_INITIAL_STATE,
        verifica: pot.noneLoading
      };
    case getType(paymentVerificaSuccess):
      return {
        ...state,
        verifica: pot.some(action.payload)
      };
    case getType(paymentVerificaFailure):
      return {
        ...state,
        verifica: pot.noneError(action.payload)
      };

    //
    // attiva
    //
    case getType(paymentAttivaRequest):
      return {
        ...state,
        attiva: pot.noneLoading
      };
    case getType(paymentAttivaSuccess):
      return {
        ...state,
        attiva: pot.some(action.payload)
      };
    case getType(paymentAttivaFailure):
      return {
        ...state,
        attiva: pot.noneError(action.payload)
      };

    //
    // payment ID polling
    //
    case getType(paymentIdPollingRequest):
      return {
        ...state,
        paymentId: pot.noneLoading
      };
    case getType(paymentIdPollingSuccess):
      return {
        ...state,
        paymentId: pot.some(action.payload)
      };
    case getType(paymentIdPollingFailure):
      return {
        ...state,
        paymentId: pot.noneError(action.payload)
      };

    //
    // check payment
    //
    case getType(paymentCheckRequest):
      return {
        ...state,
        check: pot.noneLoading
      };
    case getType(paymentCheckSuccess):
      return {
        ...state,
        check: pot.some<true>(true)
      };
    case getType(paymentCheckFailure):
      return {
        ...state,
        check: pot.noneError(action.payload)
      };

    //
    // fetch available psps
    //
    case getType(paymentFetchPspsForPaymentIdRequest):
      return {
        ...state,
        psps: pot.noneLoading
      };
    case getType(paymentFetchPspsForPaymentIdSuccess):
      return {
        ...state,
        psps: pot.some(action.payload.data)
      };
    case getType(paymentFetchPspsForPaymentIdFailure):
      return {
        ...state,
        psps: pot.noneError(action.payload)
      };

    //
    // execute payment
    //
    case getType(paymentExecutePaymentRequest):
      return {
        ...state,
        transaction: pot.noneLoading
      };
    case getType(paymentExecutePaymentSuccess):
      return {
        ...state,
        transaction: pot.some(action.payload)
      };
    case getType(paymentExecutePaymentFailure):
      return {
        ...state,
        transaction: pot.noneError(action.payload)
      };
  }
  return state;
};

export default reducer;
