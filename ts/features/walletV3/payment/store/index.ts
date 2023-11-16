import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { CalculateFeeResponse } from "../../../../../definitions/pagopa/ecommerce/CalculateFeeResponse";
import { NewTransactionResponse } from "../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RequestAuthorizationResponse } from "../../../../../definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { walletInitializePayment } from "./actions";

export type WalletPaymentState = {
  entryPoint: O.Option<string>;
  paymentDetails: pot.Pot<PaymentRequestsGetResponse, NetworkError>;
  transaction: pot.Pot<NewTransactionResponse, NetworkError>;
  psps: pot.Pot<CalculateFeeResponse, NetworkError>;
  paymentAuthRequest: pot.Pot<RequestAuthorizationResponse, NetworkError>;
};

const INITIAL_STATE: WalletPaymentState = {
  entryPoint: O.none,
  paymentDetails: pot.none,
  transaction: pot.none,
  psps: pot.none,
  paymentAuthRequest: pot.none
};

const walletPaymentReducer = (
  state: WalletPaymentState = INITIAL_STATE,
  action: Action
): WalletPaymentState => {
  switch (action.type) {
    case getType(walletInitializePayment):
      return {
        ...state,
        entryPoint: O.some(action.payload.entryPoint)
      };
  }
  return state;
};

export default walletPaymentReducer;
