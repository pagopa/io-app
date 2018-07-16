import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { createSelector } from "reselect";
import { EnteBeneficiario } from "../../../../definitions/pagopa-proxy/EnteBeneficiario";
import { PaymentRequestsGetResponse } from "../../../../definitions/pagopa-proxy/PaymentRequestsGetResponse";
import { Wallet } from "../../../../definitions/pagopa/Wallet";
import {
  PAYMENT_STORE_INITIAL_AMOUNT,
  PAYMENT_STORE_RPTID_DATA,
  PAYMENT_STORE_SELECTED_PAYMENT_METHOD,
  PAYMENT_STORE_VERIFICA_DATA
} from "../../actions/constants";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";
import { getWalletFromId, getWallets } from "./wallets";

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
  (rsp: Option<PaymentRequestsGetResponse>): Option<AmountInEuroCents> =>
    rsp.map(
      v =>
        ("0".repeat(10) + `${v.importoSingoloVersamento}`).slice(
          -10
        ) as AmountInEuroCents
    )
);

export const paymentRecipientSelector = createSelector(
  getVerificaResponse,
  (rsp: Option<PaymentRequestsGetResponse>): Option<EnteBeneficiario> =>
    rsp.mapNullable(v => v.enteBeneficiario)
);

export const paymentReasonSelector = createSelector(
  getVerificaResponse,
  (rsp: Option<PaymentRequestsGetResponse>): Option<string> =>
    rsp.mapNullable(v => v.causaleVersamento)
);

export const feeExtractor = (w: Wallet): Option<AmountInEuroCents> =>
  fromNullable(w.psp)
    .chain(psp => fromNullable(psp.fixedCost))
    .map(fee => ("0".repeat(10) + `${fee.amount}`) as AmountInEuroCents);

export const selectedPaymentMethodSelector = createSelector(
  getSelectedPaymentMethod,
  getWallets,
  getWalletFromId
);

export const reducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
): PaymentState => {
  if (action.type === PAYMENT_STORE_RPTID_DATA) {
    return {
      ...state,
      rptId: some(action.payload)
    };
  }
  if (action.type === PAYMENT_STORE_INITIAL_AMOUNT) {
    return {
      ...state,
      initialAmount: some(action.payload)
    };
  }
  if (action.type === PAYMENT_STORE_VERIFICA_DATA) {
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
