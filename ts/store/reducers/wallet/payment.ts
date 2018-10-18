import { getType } from "typesafe-actions";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { Psp } from "../../../types/pagopa";
import * as pot from "../../../types/pot";
import { Action } from "../../actions/types";
import {
  paymentPspListFailure,
  paymentPspListRequest,
  paymentPspListSuccess,
  paymentVerificaFailure,
  paymentVerificaRequest,
  paymentVerificaSuccess
} from "../../actions/wallet/payment";
import { GlobalState } from "../types";

export type PaymentState = Readonly<{
  verifica: pot.Pot<PaymentRequestsGetResponse>;
  paymentId: pot.Pot<string>;
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
  paymentId: pot.none,
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
    case getType(paymentPspListRequest):
      return {
        ...state,
        pspList: pot.noneLoading
      };
    case getType(paymentPspListSuccess):
      return {
        ...state,
        pspList: pot.some(action.payload.data)
      };
    case getType(paymentPspListFailure):
      return {
        ...state,
        pspList: pot.noneError(action.payload)
      };
  }
  return state;
};

export default reducer;
