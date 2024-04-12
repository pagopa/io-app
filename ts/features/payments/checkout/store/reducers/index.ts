import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { getType } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodsResponse";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { TransactionInfo } from "../../../../../../definitions/pagopa/ecommerce/TransactionInfo";
import { Wallets } from "../../../../../../definitions/pagopa/ecommerce/Wallets";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { WalletPaymentStepEnum } from "../../types";
import { WalletPaymentFailure } from "../../types/WalletPaymentFailure";
import {
  paymentsCalculatePaymentFeesAction,
  paymentsCreateTransactionAction,
  paymentsDeleteTransactionAction,
  paymentsGetNewSessionTokenAction,
  paymentsGetPaymentDetailsAction,
  paymentsGetPaymentMethodsAction,
  paymentsGetPaymentTransactionInfoAction,
  paymentsGetPaymentUserMethodsAction,
  paymentsResetPaymentPspList,
  paymentsStartPaymentAuthorizationAction
} from "../actions/networking";
import {
  OnPaymentSuccessAction,
  initPaymentStateAction,
  resetPaymentPspAction,
  selectPaymentMethodAction,
  selectPaymentPspAction,
  walletPaymentSetCurrentStep
} from "../actions/orchestration";
import { WalletInfo } from "../../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { PaymentMethodResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodResponse";

export const WALLET_PAYMENT_STEP_MAX = 4;

export type PaymentsCheckoutState = {
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
  selectedWallet: O.Option<WalletInfo>;
  selectedPaymentMethod: O.Option<PaymentMethodResponse>;
  selectedPsp: O.Option<Bundle>;
  transaction: pot.Pot<TransactionInfo, NetworkError | WalletPaymentFailure>;
  authorizationUrl: pot.Pot<string, NetworkError>;
  onSuccess?: OnPaymentSuccessAction;
};

const INITIAL_STATE: PaymentsCheckoutState = {
  currentStep: WalletPaymentStepEnum.PICK_PAYMENT_METHOD,
  sessionToken: pot.none,
  paymentDetails: pot.none,
  userWallets: pot.none,
  allPaymentMethods: pot.none,
  pspList: pot.none,
  selectedWallet: O.none,
  selectedPaymentMethod: O.none,
  selectedPsp: O.none,
  transaction: pot.none,
  authorizationUrl: pot.none
};

// eslint-disable-next-line complexity
const reducer = (
  state: PaymentsCheckoutState = INITIAL_STATE,
  action: Action
): PaymentsCheckoutState => {
  switch (action.type) {
    case getType(initPaymentStateAction):
      return {
        ...INITIAL_STATE,
        onSuccess: action.payload.onSuccess
      };

    case getType(walletPaymentSetCurrentStep):
      return {
        ...state,
        currentStep: _.clamp(action.payload, 1, WALLET_PAYMENT_STEP_MAX)
      };

    // eCommerce Session token
    case getType(paymentsGetNewSessionTokenAction.request):
      return {
        ...state,
        sessionToken: pot.toLoading(state.sessionToken)
      };
    case getType(paymentsGetNewSessionTokenAction.success):
      return {
        ...state,
        sessionToken: pot.some(action.payload.sessionToken)
      };
    case getType(paymentsGetNewSessionTokenAction.failure):
      return {
        ...state,
        sessionToken: pot.toError(state.sessionToken, action.payload)
      };

    // Payment verification and details
    case getType(paymentsGetPaymentDetailsAction.request):
      return {
        ...state,
        rptId: action.payload,
        paymentDetails: pot.toLoading(state.paymentDetails)
      };
    case getType(paymentsGetPaymentDetailsAction.success):
      return {
        ...state,
        paymentDetails: pot.some(action.payload)
      };
    case getType(paymentsGetPaymentDetailsAction.failure):
      return {
        ...state,
        paymentDetails: pot.toError(state.paymentDetails, action.payload)
      };

    // User payment methods
    case getType(paymentsGetPaymentUserMethodsAction.request):
      return {
        ...state,
        userWallets: pot.toLoading(state.userWallets)
      };
    case getType(paymentsGetPaymentUserMethodsAction.success):
      return {
        ...state,
        userWallets: pot.some(action.payload)
      };
    case getType(paymentsGetPaymentUserMethodsAction.failure):
      return {
        ...state,
        userWallets: pot.toError(state.userWallets, action.payload)
      };

    // Available payment method
    case getType(paymentsGetPaymentMethodsAction.request):
      return {
        ...state,
        allPaymentMethods: pot.toLoading(state.allPaymentMethods)
      };
    case getType(paymentsGetPaymentMethodsAction.success):
      return {
        ...state,
        allPaymentMethods: pot.some(action.payload)
      };
    case getType(paymentsGetPaymentMethodsAction.failure):
      return {
        ...state,
        allPaymentMethods: pot.toError(state.allPaymentMethods, action.payload)
      };

    case getType(selectPaymentMethodAction):
      return {
        ...state,
        selectedWallet: O.fromNullable(action.payload.userWallet),
        selectedPaymentMethod: O.fromNullable(action.payload.paymentMethod)
      };

    // PSP list
    case getType(paymentsCalculatePaymentFeesAction.request):
      return {
        ...state,
        pspList: pot.toLoading(state.pspList)
      };
    case getType(paymentsCalculatePaymentFeesAction.success):
      return {
        ...state,
        pspList: pot.some(action.payload.bundles)
      };
    case getType(paymentsCalculatePaymentFeesAction.failure):
      return {
        ...state,
        pspList: pot.toError(state.pspList, action.payload)
      };

    case getType(selectPaymentPspAction):
      return {
        ...state,
        selectedPsp: O.some(action.payload)
      };

    case getType(resetPaymentPspAction):
      return {
        ...state,
        selectedPsp: O.none
      };

    case getType(paymentsResetPaymentPspList):
      return {
        ...state,
        pspList: pot.none
      };

    // Transaction
    case getType(paymentsCreateTransactionAction.request):
    case getType(paymentsGetPaymentTransactionInfoAction.request):
    case getType(paymentsDeleteTransactionAction.request):
      return {
        ...state,
        transaction: pot.toLoading(state.transaction)
      };
    case getType(paymentsCreateTransactionAction.success):
    case getType(paymentsGetPaymentTransactionInfoAction.success):
      return {
        ...state,
        transaction: pot.some(action.payload)
      };
    case getType(paymentsDeleteTransactionAction.success):
      return {
        ...state,
        transaction: pot.none
      };
    case getType(paymentsCreateTransactionAction.failure):
    case getType(paymentsGetPaymentTransactionInfoAction.failure):
    case getType(paymentsDeleteTransactionAction.failure):
      return {
        ...state,
        transaction: pot.toError(state.transaction, action.payload)
      };

    // Authorization url
    case getType(paymentsStartPaymentAuthorizationAction.request):
      return {
        ...state,
        authorizationUrl: pot.toLoading(state.authorizationUrl)
      };
    case getType(paymentsStartPaymentAuthorizationAction.success):
      return {
        ...state,
        authorizationUrl: pot.some(action.payload.authorizationUrl)
      };
    case getType(paymentsStartPaymentAuthorizationAction.failure):
      return {
        ...state,
        authorizationUrl: pot.toError(state.authorizationUrl, action.payload)
      };
    case getType(paymentsStartPaymentAuthorizationAction.cancel):
      return {
        ...state,
        authorizationUrl: pot.none
      };
  }
  return state;
};

export default reducer;
