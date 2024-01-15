import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { AsyncStorage } from "react-native";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { NewTransactionResponse } from "../../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodsResponse";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { Wallets } from "../../../../../../definitions/pagopa/walletv3/Wallets";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { WalletPaymentFailure } from "../../types/failure";
import {
  walletPaymentAuthorization,
  walletPaymentCalculateFees,
  walletPaymentCreateTransaction,
  walletPaymentDeleteTransaction,
  walletPaymentGetAllMethods,
  walletPaymentGetDetails,
  walletPaymentGetUserWallets
} from "../actions/networking";
import {
  walletPaymentInitState,
  walletPaymentPickPaymentMethod,
  walletPaymentPickPsp,
  walletPaymentResetPickedPsp
} from "../actions/orchestration";

export type WalletPaymentState = {
  rptId?: RptId;
  paymentDetails: pot.Pot<
    PaymentRequestsGetResponse,
    NetworkError | WalletPaymentFailure
  >;
  userWallets: pot.Pot<Wallets, NetworkError>;
  allPaymentMethods: pot.Pot<PaymentMethodsResponse, NetworkError>;
  pspList: pot.Pot<ReadonlyArray<Bundle>, NetworkError>;
  chosenPaymentMethod: O.Option<WalletInfo>;
  chosenPsp: O.Option<Bundle>;
  transaction: pot.Pot<
    NewTransactionResponse,
    NetworkError | WalletPaymentFailure
  >;
  authorizationUrl: pot.Pot<string, NetworkError>;
  tentativeByRptId: Record<RptId, number>;
};

const INITIAL_STATE: WalletPaymentState = {
  paymentDetails: pot.none,
  userWallets: pot.none,
  allPaymentMethods: pot.none,
  pspList: pot.none,
  chosenPaymentMethod: O.none,
  chosenPsp: O.none,
  transaction: pot.none,
  authorizationUrl: pot.none,
  tentativeByRptId: {}
};

// eslint-disable-next-line complexity
const reducer = (
  state: WalletPaymentState = INITIAL_STATE,
  action: Action
): WalletPaymentState => {
  switch (action.type) {
    case getType(walletPaymentInitState):
      return {
        ...INITIAL_STATE,
        tentativeByRptId: state.tentativeByRptId
      };

    // Payment verification and details
    case getType(walletPaymentGetDetails.request):
      return {
        ...state,
        rptId: action.payload,
        paymentDetails: pot.toLoading(state.paymentDetails),
        tentativeByRptId: {
          ...state.tentativeByRptId,
          [action.payload]: (state.tentativeByRptId[action.payload] || 0) + 1
        }
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
        userWallets: pot.some(action.payload)
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
        allPaymentMethods: pot.some(action.payload)
      };
    case getType(walletPaymentGetAllMethods.failure):
      return {
        ...state,
        allPaymentMethods: pot.toError(state.allPaymentMethods, action.payload)
      };

    case getType(walletPaymentPickPaymentMethod):
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

    case getType(walletPaymentPickPsp):
      return {
        ...state,
        chosenPsp: O.some(action.payload)
      };

    case getType(walletPaymentResetPickedPsp):
      return {
        ...state,
        chosenPsp: O.none
      };

    // Create/delete transaction
    case getType(walletPaymentCreateTransaction.request):
    case getType(walletPaymentDeleteTransaction.request):
      return {
        ...state,
        transaction: pot.toLoading(state.transaction)
      };
    case getType(walletPaymentCreateTransaction.success):
      return {
        ...state,
        transaction: pot.some(action.payload)
      };
    case getType(walletPaymentDeleteTransaction.success):
      return {
        ...state,
        transaction: pot.none
      };
    case getType(walletPaymentCreateTransaction.failure):
    case getType(walletPaymentDeleteTransaction.failure):
      return {
        ...state,
        transaction: pot.toError(state.transaction, action.payload)
      };

    // Authorization url
    case getType(walletPaymentAuthorization.request):
      return {
        ...state,
        authorizationUrl: pot.toLoading(state.authorizationUrl)
      };
    case getType(walletPaymentAuthorization.success):
      return {
        ...state,
        authorizationUrl: pot.some(action.payload.authorizationUrl)
      };
    case getType(walletPaymentAuthorization.failure):
      return {
        ...state,
        authorizationUrl: pot.toError(state.authorizationUrl, action.payload)
      };
    case getType(walletPaymentAuthorization.cancel):
      return {
        ...state,
        authorizationUrl: pot.none
      };
  }
  return state;
};

const CURRENT_REDUX_PAYMENT_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "payment",
  storage: AsyncStorage,
  version: CURRENT_REDUX_PAYMENT_STORE_VERSION,
  whitelist: ["tentativeByRptId"]
};

const persistedReducer = persistReducer<WalletPaymentState, Action>(
  persistConfig,
  reducer
);

export default persistedReducer;
