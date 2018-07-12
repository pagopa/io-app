import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { createSelector } from "reselect";
import { EnteBeneficiario } from "../../../../definitions/pagopa-proxy/EnteBeneficiario";
import { PaymentRequestsGetResponse } from "../../../../definitions/pagopa-proxy/PaymentRequestsGetResponse";
import {
  PAYMENT_STORE_SELECTED_PAYMENT_METHOD,
  STORE_INITIAL_AMOUNT,
  STORE_RPTID_DATA,
  STORE_VERIFICA_DATA
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";
import { getCardFromId, getCards } from "./cards";
import { Wallet } from "../../../../definitions/pagopa/Wallet";

export type PaymentState = Readonly<{
  rptId: Option<RptId>;
  verificaResponse: Option<PaymentRequestsGetResponse>;
  initialAmount: Option<AmountInEuroCents>;
  selectedPaymentMethod: Option<number>;
}>;

export const PAYMENT_INITIAL_STATE: PaymentState = {
  rptId: none,
  verificaResponse: none,
  initialAmount: none,
  selectedPaymentMethod: none
};

export const getVerificaResponse = (
  state: GlobalState
): Option<PaymentRequestsGetResponse> => state.wallet.payment.verificaResponse;

export const getRptId = (state: GlobalState): Option<RptId> =>
  state.wallet.payment.rptId;

export const getInitialAmount = (
  state: GlobalState
): Option<AmountInEuroCents> => state.wallet.payment.initialAmount;

export const getSelectedPaymentMethod = (state: GlobalState): Option<number> =>
  state.wallet.payment.selectedPaymentMethod;

export const currentAmountSelector = createSelector(
  getVerificaResponse,
  (rsp: Option<PaymentRequestsGetResponse>): Option<AmountInEuroCents> => {
    if (rsp.isNone()) {
      return none;
    }
    // TODO: update proxy to return AmountInEuroCents
    return some((
      "0".repeat(10) + `${rsp.value.importoSingoloVersamento}`
    ).slice(-10) as AmountInEuroCents);
  }
);

export const paymentRecipientSelector = createSelector(
  getVerificaResponse,
  (rsp: Option<PaymentRequestsGetResponse>): Option<EnteBeneficiario> => {
    if (rsp.isNone() || rsp.value.enteBeneficiario === undefined) {
      return none;
    }
    return some(rsp.value.enteBeneficiario);
  }
);

export const paymentReasonSelector = createSelector(
  getVerificaResponse,
  (rsp: Option<PaymentRequestsGetResponse>): Option<string> => {
    if (rsp.isNone() || rsp.value.causaleVersamento === undefined) {
      return none;
    }
    return some(rsp.value.causaleVersamento);
  }
);

export const feeExtractor = (w: Wallet): Option<AmountInEuroCents> => {
  if (w.psp === undefined || w.psp.fixedCost === undefined) {
    return none;
  }
  return some(("0".repeat(10) +
    `${w.psp.fixedCost.amount}`) as AmountInEuroCents);
};

export const selectedPaymentMethodSelector = createSelector(
  getSelectedPaymentMethod,
  getCards,
  getCardFromId
);

export const reducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
): PaymentState => {
  if (action.type === STORE_RPTID_DATA) {
    return {
      ...state,
      rptId: some(action.payload)
    };
  }
  if (action.type === STORE_INITIAL_AMOUNT) {
    return {
      ...state,
      initialAmount: some(action.payload)
    };
  }
  if (action.type === STORE_VERIFICA_DATA) {
    return {
      ...state,
      verificaResponse: some(action.payload)
    };
  }
  if (action.type === PAYMENT_STORE_SELECTED_PAYMENT_METHOD) {
    return {
      ...state,
      selectedPaymentMethod: some(action.payload)
    };
  }
  return state;
};

export default reducer;
