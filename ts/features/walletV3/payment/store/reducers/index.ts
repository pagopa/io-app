import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { PaymentMethodResponse } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  walletPaymentCalculateFees,
  walletPaymentChoosePaymentMethod,
  walletPaymentChoosePsp,
  walletPaymentCreateTransaction,
  walletPaymentGetAllMethods,
  walletPaymentGetDetails,
  walletPaymentGetUserWallets,
  walletPaymentInitState
} from "../actions";
import { NewTransactionResponse } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";

export type WalletPaymentState = {
  paymentDetails: pot.Pot<PaymentRequestsGetResponse, NetworkError>;
  userWallets: pot.Pot<ReadonlyArray<WalletInfo>, NetworkError>;
  allPaymentMethods: pot.Pot<
    ReadonlyArray<PaymentMethodResponse>,
    NetworkError
  >;
  pspList: pot.Pot<ReadonlyArray<Bundle>, NetworkError>;
  chosenPaymentMethod: O.Option<string>;
  chosenPsp: O.Option<string>;
  transaction: pot.Pot<NewTransactionResponse, NetworkError>;
  authorizationUrl: pot.Pot<string, NetworkError>;
};

const INITIAL_STATE: WalletPaymentState = {
  paymentDetails: pot.none,
  userWallets: pot.none,
  allPaymentMethods: pot.none,
  pspList: pot.none,
  chosenPaymentMethod: O.none,
  chosenPsp: O.none,
  transaction: pot.none,
  authorizationUrl: pot.none
};

// eslint-disable-next-line complexity
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

    case getType(walletPaymentChoosePaymentMethod):
      return {
        ...state,
        chosenPaymentMethod: O.some(action.payload)
      };

    // PSP list
    case getType(walletPaymentCalculateFees.request):
      return {
        ...state,
        pspList: pot.toLoading(state.pspList)
      };
    case getType(walletPaymentCalculateFees.success):
      return {
        ...state,
        pspList: pot.some(action.payload.bundles)
      };
    case getType(walletPaymentCalculateFees.failure):
      return {
        ...state,
        pspList: pot.toError(state.pspList, action.payload)
      };

    case getType(walletPaymentChoosePsp):
      return {
        ...state,
        chosenPsp: O.some(action.payload)
      };

    // Created transaction data
    case getType(walletPaymentCreateTransaction.request):
      return {
        ...state,
        transaction: pot.toLoading(state.transaction)
      };
    case getType(walletPaymentCreateTransaction.success):
      return {
        ...state,
        transaction: pot.some(action.payload)
      };
    case getType(walletPaymentCreateTransaction.failure):
      return {
        ...state,
        transaction: pot.toError(state.transaction, action.payload)
      };
  }
  return state;
};

export default reducer;
