import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Bundle } from "../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { walletGetPaymentDetails, walletPaymentInitState } from "./actions";

export type WalletPaymentState = {
  paymentDetails: pot.Pot<PaymentRequestsGetResponse, NetworkError>;
  transactionId: pot.Pot<string, NetworkError>;
  pspList: pot.Pot<Array<Bundle>, NetworkError>;
  authorizationUrl: pot.Pot<string, NetworkError>;
};

const INITIAL_STATE: WalletPaymentState = {
  paymentDetails: pot.none,
  transactionId: pot.none,
  pspList: pot.none,
  authorizationUrl: pot.none
};

const reducer = (
  state: WalletPaymentState = INITIAL_STATE,
  action: Action
): WalletPaymentState => {
  switch (action.type) {
    case getType(walletPaymentInitState):
      return INITIAL_STATE;
    case getType(walletGetPaymentDetails.request):
      return {
        ...state,
        paymentDetails: pot.toLoading(state.paymentDetails)
      };
    case getType(walletGetPaymentDetails.success):
      return {
        ...state,
        paymentDetails: pot.some(action.payload)
      };
    case getType(walletGetPaymentDetails.failure):
      return {
        ...state,
        paymentDetails: pot.toError(state.paymentDetails, action.payload)
      };
  }
  return state;
};

export default reducer;
