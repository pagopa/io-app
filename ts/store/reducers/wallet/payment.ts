import { getType } from "typesafe-actions";
import { PaymentActivationsPostResponse } from "../../../../definitions/backend/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Psp } from "../../../types/pagopa";
import * as pot from "../../../types/pot";
import { Action } from "../../actions/types";
import {
  paymentAttivaFailure,
  paymentAttivaRequest,
  paymentAttivaSuccess,
  paymentCheckFailure,
  paymentCheckRequest,
  paymentCheckSuccess,
  paymentFetchPspsForPaymentIdFailure,
  paymentFetchPspsForPaymentIdRequest,
  paymentFetchPspsForPaymentIdSuccess,
  paymentIdPollingFailure,
  paymentIdPollingRequest,
  paymentIdPollingSuccess,
  paymentVerificaFailure,
  paymentVerificaRequest,
  paymentVerificaSuccess
} from "../../actions/wallet/payment";
import { GlobalState } from "../types";

export type PaymentState = Readonly<{
  verifica: pot.Pot<PaymentRequestsGetResponse>;
  attiva: pot.Pot<PaymentActivationsPostResponse>;
  paymentId: pot.Pot<string>;
  check: pot.Pot<true>;
  pspList: pot.Pot<ReadonlyArray<Psp>>;
}>;

/**
 * Returns the payment ID if one has been fetched so far
 */
export const getPaymentIdFromGlobalState = (state: GlobalState) =>
  pot.toOption(state.wallet.payment.paymentId);

export const isPaymentOngoingSelector = (state: GlobalState) =>
  getPaymentIdFromGlobalState(state).isSome();

const PAYMENT_INITIAL_STATE: PaymentState = {
  verifica: pot.none,
  attiva: pot.none,
  paymentId: pot.none,
  check: pot.none,
  pspList: pot.none
};

/**
 * Reducer for actions that show the payment summary
 */
const reducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
): PaymentState => {
  switch (action.type) {
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
    // getPspList
    //

    case getType(paymentFetchPspsForPaymentIdRequest):
      return {
        ...state,
        pspList: pot.noneLoading
      };
    case getType(paymentFetchPspsForPaymentIdSuccess):
      return {
        ...state,
        pspList: pot.some(action.payload.data)
      };
    case getType(paymentFetchPspsForPaymentIdFailure):
      return {
        ...state,
        pspList: pot.noneError(action.payload)
      };
  }
  return state;
};

export default reducer;
