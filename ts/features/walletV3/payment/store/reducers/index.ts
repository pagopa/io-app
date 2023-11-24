import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { PaymentMethodResponse } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  walletPaymentGetAllMethods,
  walletPaymentGetDetails,
  walletPaymentGetUserWallets,
  walletPaymentInitState
} from "../actions";

export type WalletPaymentState = {
  paymentDetails: pot.Pot<PaymentRequestsGetResponse, NetworkError>;
  userWallets: pot.Pot<ReadonlyArray<WalletInfo>, NetworkError>;
  allPaymentMethods: pot.Pot<
    ReadonlyArray<PaymentMethodResponse>,
    NetworkError
  >;
  transactionId: pot.Pot<string, NetworkError>;
  pspList: pot.Pot<Array<Bundle>, NetworkError>;
  authorizationUrl: pot.Pot<string, NetworkError>;
};

const INITIAL_STATE: WalletPaymentState = {
  paymentDetails: pot.none,
  userWallets: pot.none,
  allPaymentMethods: pot.none,
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

    // Payment verification and details
    case getType(walletPaymentGetDetails.request):
      return {
        ...state,
        paymentDetails: pot.toLoading(state.paymentDetails)
      };
    case getType(walletPaymentGetDetails.success):
      return {
        ...state,
        paymentDetails: pot.some(action.payload)
      };
    case getType(walletPaymentGetDetails.failure):
      return {
        ...state,
        paymentDetails: pot.toError(state.paymentDetails, action.payload)
      };

    // User payment methods
    case getType(walletPaymentGetUserWallets.request):
      return {
        ...state,
        userWallets: pot.toLoading(state.userWallets)
      };
    case getType(walletPaymentGetUserWallets.success):
      return {
        ...state,
        userWallets: pot.some(action.payload.wallets ?? [])
      };
    case getType(walletPaymentGetUserWallets.failure):
      return {
        ...state,
        userWallets: pot.toError(state.userWallets, action.payload)
      };

    // Available payment method
    case getType(walletPaymentGetAllMethods.request):
      return {
        ...state,
        allPaymentMethods: pot.toLoading(state.allPaymentMethods)
      };
    case getType(walletPaymentGetAllMethods.success):
      return {
        ...state,
        allPaymentMethods: pot.some(action.payload.paymentMethods ?? [])
      };
    case getType(walletPaymentGetAllMethods.failure):
      return {
        ...state,
        allPaymentMethods: pot.toError(state.allPaymentMethods, action.payload)
      };
  }
  return state;
};

export default reducer;
