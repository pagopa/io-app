import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { getType } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodsResponse";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { TransactionInfo } from "../../../../../../definitions/pagopa/ecommerce/TransactionInfo";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { PaymentStartRoute, WalletPaymentStepEnum } from "../../types";
import {
  walletPaymentAuthorization,
  walletPaymentCalculateFees,
  walletPaymentCreateTransaction,
  walletPaymentDeleteTransaction,
  walletPaymentGetAllMethods,
  walletPaymentGetDetails,
  walletPaymentGetTransactionInfo,
  walletPaymentGetUserWallets,
  walletPaymentNewSessionToken,
  walletPaymentResetPspList
} from "../actions/networking";
import {
  walletPaymentInitState,
  walletPaymentPickPaymentMethod,
  walletPaymentPickPsp,
  walletPaymentResetPickedPsp,
  walletPaymentSetCurrentStep
} from "../actions/orchestration";
import { WalletPaymentFailure } from "../../types/WalletPaymentFailure";
import { Wallets } from "../../../../../../definitions/pagopa/ecommerce/Wallets";
import { WalletInfo } from "../../../../../../definitions/pagopa/ecommerce/WalletInfo";

export const WALLET_PAYMENT_STEP_MAX = 4;

export type WalletPaymentState = {
  currentStep: WalletPaymentStepEnum;
  rptId?: RptId;
  sessionToken: pot.Pot<string, NetworkError>;
  paymentDetails: pot.Pot<
    PaymentRequestsGetResponse,
    NetworkError | WalletPaymentFailure
  >;
  userWallets: pot.Pot<Wallets, NetworkError>;
  allPaymentMethods: pot.Pot<PaymentMethodsResponse, NetworkError>;
  pspList: pot.Pot<ReadonlyArray<Bundle>, NetworkError>;
  chosenPaymentMethod: O.Option<WalletInfo>;
  chosenPsp: O.Option<Bundle>;
  transaction: pot.Pot<TransactionInfo, NetworkError | WalletPaymentFailure>;
  authorizationUrl: pot.Pot<string, NetworkError>;
  startRoute?: PaymentStartRoute;
  showTransaction?: boolean;
};

const INITIAL_STATE: WalletPaymentState = {
  currentStep: WalletPaymentStepEnum.PICK_PAYMENT_METHOD,
  sessionToken: pot.none,
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
      return {
        ...INITIAL_STATE,
        startRoute: action.payload.startRoute,
        showTransaction: action.payload.showTransaction
      };

    case getType(walletPaymentSetCurrentStep):
      return {
        ...state,
        currentStep: _.clamp(action.payload, 1, WALLET_PAYMENT_STEP_MAX)
      };

    // eCommerce Session token
    case getType(walletPaymentNewSessionToken.request):
      return {
        ...state,
        sessionToken: pot.toLoading(state.sessionToken)
      };
    case getType(walletPaymentNewSessionToken.success):
      return {
        ...state,
        sessionToken: pot.some(action.payload.sessionToken)
      };
    case getType(walletPaymentNewSessionToken.failure):
      return {
        ...state,
        sessionToken: pot.toError(state.sessionToken, action.payload)
      };

    // Payment verification and details
    case getType(walletPaymentGetDetails.request):
      return {
        ...state,
        rptId: action.payload,
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

    case getType(walletPaymentResetPspList):
      return {
        ...state,
        pspList: pot.none
      };

    // Transaction
    case getType(walletPaymentCreateTransaction.request):
    case getType(walletPaymentGetTransactionInfo.request):
    case getType(walletPaymentDeleteTransaction.request):
      return {
        ...state,
        transaction: pot.toLoading(state.transaction)
      };
    case getType(walletPaymentCreateTransaction.success):
    case getType(walletPaymentGetTransactionInfo.success):
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
    case getType(walletPaymentGetTransactionInfo.failure):
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

export default reducer;
