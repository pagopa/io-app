import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { getType, isActionOf } from "typesafe-actions";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentMethodResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodResponse";
import { PaymentMethodsResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodsResponse";
import { PaymentRequestsGetResponse } from "../../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { TransactionInfo } from "../../../../../../definitions/pagopa/ecommerce/TransactionInfo";
import { UserLastPaymentMethodResponse } from "../../../../../../definitions/pagopa/ecommerce/UserLastPaymentMethodResponse";
import { WalletInfo } from "../../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { Wallets } from "../../../../../../definitions/pagopa/ecommerce/Wallets";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { getSortedPspList } from "../../../common/utils";
import { WalletPaymentStepEnum } from "../../types";
import { FaultCodeCategoryEnum as PaymentMethodNotAvailableEnum } from "../../types/PspPaymentMethodNotAvailableProblemJson";
import { WalletPaymentFailure } from "../../types/WalletPaymentFailure";
import {
  paymentsCalculatePaymentFeesAction,
  paymentsCreateTransactionAction,
  paymentsDeleteTransactionAction,
  paymentsGetContextualOnboardingUrlAction,
  paymentsGetPaymentDetailsAction,
  paymentsGetPaymentMethodsAction,
  paymentsGetPaymentTransactionInfoAction,
  paymentsGetPaymentUserMethodsAction,
  paymentsGetRecentPaymentMethodUsedAction,
  paymentsStartPaymentAuthorizationAction
} from "../actions/networking";
import {
  OnPaymentSuccessAction,
  PaymentStartWebViewPayload,
  initPaymentStateAction,
  paymentMethodPspBannerClose,
  paymentStartWebViewFlow,
  selectPaymentMethodAction,
  selectPaymentPspAction,
  walletPaymentSetCurrentStep
} from "../actions/orchestration";
export const WALLET_PAYMENT_STEP_MAX = 4;

type ContextualPayment = {
  orderId?: string;
  onboardingUrl: pot.Pot<string, NetworkError>;
  onboardedWalletId?: string;
};

export type PaymentsCheckoutState = {
  currentStep: WalletPaymentStepEnum;
  rptId?: RptId;
  paymentDetails: pot.Pot<
    PaymentRequestsGetResponse,
    NetworkError | WalletPaymentFailure
  >;
  userWallets: pot.Pot<Wallets, NetworkError>;
  recentUsedPaymentMethod: pot.Pot<UserLastPaymentMethodResponse, NetworkError>;
  allPaymentMethods: pot.Pot<PaymentMethodsResponse, NetworkError>;
  pspList: pot.Pot<ReadonlyArray<Bundle>, NetworkError | WalletPaymentFailure>;
  selectedWallet: O.Option<WalletInfo>;
  selectedPaymentMethod: O.Option<PaymentMethodResponse>;
  selectedPsp: O.Option<Bundle>;
  transaction: pot.Pot<TransactionInfo, NetworkError | WalletPaymentFailure>;
  authorizationUrl: pot.Pot<string, NetworkError>;
  onSuccess?: OnPaymentSuccessAction;
  pspBannerClosed: Set<string>;
  webViewPayload?: PaymentStartWebViewPayload;
  contextualPayment: ContextualPayment;
};

const INITIAL_STATE: PaymentsCheckoutState = {
  currentStep: WalletPaymentStepEnum.NONE,
  paymentDetails: pot.none,
  userWallets: pot.none,
  recentUsedPaymentMethod: pot.none,
  allPaymentMethods: pot.none,
  pspList: pot.none,
  selectedWallet: O.none,
  selectedPaymentMethod: O.none,
  selectedPsp: O.none,
  transaction: pot.none,
  authorizationUrl: pot.none,
  pspBannerClosed: new Set(),
  webViewPayload: undefined,
  contextualPayment: {
    onboardingUrl: pot.none,
    onboardedWalletId: undefined,
    orderId: undefined
  }
};

// eslint-disable-next-line complexity
const reducer = (
  state: PaymentsCheckoutState = INITIAL_STATE,
  action: Action
): PaymentsCheckoutState => {
  // eslint-disable-next-line sonarjs/max-switch-cases
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

    case getType(paymentMethodPspBannerClose):
      return {
        ...state,
        pspBannerClosed: new Set([...state.pspBannerClosed, action.payload])
      };

    // Payment verification and details
    case getType(paymentsGetPaymentDetailsAction.request):
      return {
        ...state,
        rptId: action.payload,
        recentUsedPaymentMethod: pot.none,
        selectedPaymentMethod: O.none,
        selectedWallet: O.none,
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

    // Recent payment method
    case getType(paymentsGetRecentPaymentMethodUsedAction.request):
      return {
        ...state,
        recentUsedPaymentMethod: pot.toLoading(state.recentUsedPaymentMethod)
      };
    case getType(paymentsGetRecentPaymentMethodUsedAction.success):
      return {
        ...state,
        recentUsedPaymentMethod: pot.some(action.payload)
      };
    case getType(paymentsGetRecentPaymentMethodUsedAction.failure):
      return {
        ...state,
        recentUsedPaymentMethod: pot.toError(
          state.recentUsedPaymentMethod,
          action.payload
        )
      };

    case getType(selectPaymentMethodAction):
      return {
        ...state,
        selectedWallet: O.fromNullable(action.payload.userWallet),
        selectedPaymentMethod: O.fromNullable(action.payload.paymentMethod),
        // If payment method changes, reset PSP list
        selectedPsp: O.none,
        pspList: pot.none,
        contextualPayment: {
          ...state.contextualPayment,
          orderId: undefined,
          onboardedWalletId: undefined
        }
      };

    // PSP list
    case getType(paymentsCalculatePaymentFeesAction.request):
      return {
        ...state,
        pspList: pot.toLoading(state.pspList)
      };
    case getType(paymentsCalculatePaymentFeesAction.success):
      const bundles = action.payload.bundles;
      // We choose the next step based on the PSP list lenght
      // If only 1 PSP we do not have the need to selected one
      const currentStep =
        bundles.length > 1
          ? WalletPaymentStepEnum.PICK_PSP
          : WalletPaymentStepEnum.CONFIRM_TRANSACTION;

      // Bundles are stored sorted by default sort rule
      const sortedBundles = getSortedPspList(bundles, "default");

      // Automatically select PSP if only 1 received
      const preselectedPsp =
        sortedBundles.length === 1
          ? O.some(sortedBundles[0])
          : state.selectedPsp;

      // Use the preselected PSP only if there isn't any already selected PSP
      const selectedPsp = pipe(
        state.selectedPsp,
        O.alt(() => preselectedPsp)
      );

      return {
        ...state,
        pspList: pot.some(sortedBundles),
        currentStep,
        contextualPayment: {
          ...state.contextualPayment,
          orderId: action.payload.orderId
        },
        selectedPsp
      };
    case getType(paymentsCalculatePaymentFeesAction.cancel):
      return {
        ...state,
        pspList: pot.none,
        selectedPaymentMethod: O.none,
        currentStep: WalletPaymentStepEnum.PICK_PAYMENT_METHOD,
        selectedPsp: O.none,
        selectedWallet: O.none
      };
    case getType(paymentsCalculatePaymentFeesAction.failure):
      return {
        ...state,
        pspList: pot.toError(
          state.pspList,
          action.payload.kind === "notFound"
            ? {
                faultCodeCategory:
                  PaymentMethodNotAvailableEnum.PSP_PAYMENT_METHOD_NOT_AVAILABLE_ERROR,
                faultCodeDetail: ""
              }
            : action.payload
        )
      };

    case getType(selectPaymentPspAction):
      return {
        ...state,
        selectedPsp: O.some(action.payload)
      };

    // Transaction
    case getType(paymentsCreateTransactionAction.request):
      return {
        ...state,
        contextualPayment: {
          ...state.contextualPayment,
          orderId: action.payload.orderId
        }
      };
    case getType(paymentsGetPaymentTransactionInfoAction.request):
    case getType(paymentsDeleteTransactionAction.request):
      const onboardedWalletId = isActionOf(
        paymentsGetPaymentTransactionInfoAction.request,
        action
      )
        ? action.payload.walletId
        : undefined;
      return {
        ...state,
        transaction: pot.toLoading(state.transaction),
        contextualPayment: {
          ...state.contextualPayment,
          orderId: undefined,
          onboardedWalletId
        }
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
    case getType(paymentsGetContextualOnboardingUrlAction.request):
      return {
        ...state,
        contextualPayment: {
          ...state.contextualPayment,
          onboardingUrl: pot.toLoading(state.contextualPayment?.onboardingUrl)
        }
      };
    case getType(paymentsGetContextualOnboardingUrlAction.success):
      return {
        ...state,
        contextualPayment: {
          ...state.contextualPayment,
          onboardingUrl: action.payload.redirectUrl
            ? pot.some(action.payload.redirectUrl)
            : pot.none
        }
      };
    case getType(paymentsGetContextualOnboardingUrlAction.failure):
      return {
        ...state,
        contextualPayment: {
          ...state.contextualPayment,
          onboardingUrl: pot.toError(
            state.contextualPayment?.onboardingUrl,
            action.payload
          )
        }
      };
    case getType(paymentStartWebViewFlow):
      return {
        ...state,
        webViewPayload: action.payload
      };
  }
  return state;
};

export default reducer;
