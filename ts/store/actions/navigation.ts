import {
  NavigationActions,
  NavigationBackActionPayload,
  StackActions
} from "react-navigation";
import CreditCardDetailScreen from "../../features/wallet/creditCard/screen/CreditCardDetailScreen";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import CieCardReaderScreen from "../../screens/authentication/cie/CieCardReaderScreen";
import { MessageDetailScreen } from "../../screens/messages/MessageDetailScreen";
import FingerprintScreen from "../../screens/onboarding/FingerprintScreen";
import OnboardingServicesPreferenceScreen from "../../screens/onboarding/OnboardingServicesPreferenceScreen";
import ServiceDetailsScreen from "../../screens/services/ServiceDetailsScreen";
import AddCardScreen from "../../screens/wallet/AddCardScreen";
import AddCreditCardOutcomeCodeMessage from "../../screens/wallet/AddCreditCardOutcomeCodeMessage";
import AddPaymentMethodScreen from "../../screens/wallet/AddPaymentMethodScreen";
import ConfirmCardDetailsScreen from "../../screens/wallet/ConfirmCardDetailsScreen";
import CreditCardOnboardingAttemptDetailScreen from "../../screens/wallet/creditCardOnboardingAttempts/CreditCardOnboardingAttemptDetailScreen";
import ConfirmPaymentMethodScreen from "../../screens/wallet/payment/ConfirmPaymentMethodScreen";
import ManualDataInsertionScreen from "../../screens/wallet/payment/ManualDataInsertionScreen";
import PickPaymentMethodScreen from "../../screens/wallet/payment/PickPaymentMethodScreen";
import PickPspScreen from "../../screens/wallet/payment/PickPspScreen";
import TransactionErrorScreen from "../../screens/wallet/payment/TransactionErrorScreen";
import TransactionSuccessScreen from "../../screens/wallet/payment/TransactionSuccessScreen";
import TransactionSummaryScreen from "../../screens/wallet/payment/TransactionSummaryScreen";
import PaymentHistoryDetailsScreen from "../../screens/wallet/PaymentHistoryDetailsScreen";
import TransactionDetailsScreen from "../../screens/wallet/TransactionDetailsScreen";
import WalletHomeScreen from "../../screens/wallet/WalletHomeScreen";
import {
  BancomatPaymentMethod,
  BPayPaymentMethod,
  CreditCardPaymentMethod,
  PrivativePaymentMethod,
  SatispayPaymentMethod
} from "../../types/pagopa";
import { InferNavigationParams } from "../../types/react";

/**
 * @deprecated
 */
export const resetToAuthenticationRoute = () =>
  NavigationService.dispatchNavigationAction(
    StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: ROUTES.AUTHENTICATION
        })
      ]
    })
  );

/**
 * @deprecated
 */
export const navigateToMainNavigatorAction = () =>
  NavigationService.dispatchNavigationAction(
    StackActions.reset({
      key: "StackRouterRoot",
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: ROUTES.MAIN
        })
      ]
    })
  );

/**
 * @deprecated
 */
export const navigateBack = (options?: NavigationBackActionPayload) =>
  NavigationService.dispatchNavigationAction(NavigationActions.back(options));

/**
 * Authentication
 */

/**
 * @deprecated
 */
export const navigateToIdpSelectionScreenAction = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.AUTHENTICATION,
      action: NavigationActions.navigate({
        routeName: ROUTES.AUTHENTICATION_IDP_SELECTION
      })
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingPinScreenAction = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING,
      action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_PIN })
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingFingerprintScreenAction = (
  params: InferNavigationParams<typeof FingerprintScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_FINGERPRINT,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToTosScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING,
      action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_TOS })
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingServicePreferenceCompleteAction = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE
    })
  );

/**
 * @deprecated
 */
export const navigateToServicesPreferenceModeSelectionScreen = (
  params: InferNavigationParams<typeof OnboardingServicesPreferenceScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_SERVICES_PREFERENCE,
      params
    })
  );

/**
 * Email
 */

/**
 * @deprecated
 */
export const navigateToEmailReadScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.READ_EMAIL_SCREEN
    })
  );

/**
 * @deprecated
 */
export const navigateToEmailInsertScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.INSERT_EMAIL_SCREEN
    })
  );

/**
 * Message
 */

/**
 * @deprecated
 */
export const navigateToMessageDetailScreenAction = (
  params: InferNavigationParams<typeof MessageDetailScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.MESSAGE_DETAIL,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToMessageRouterScreen = (
  params: InferNavigationParams<typeof MessageDetailScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.MESSAGE_ROUTER,
      params
    })
  );

/**
 * Service
 */

/**
 * @deprecated
 */
export const navigateToServiceHomeScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.SERVICES_HOME
    })
  );

/**
 * @deprecated
 */
export const navigateToServiceDetailsScreen = (
  params: InferNavigationParams<typeof ServiceDetailsScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.SERVICE_DETAIL,
      params
    })
  );

/**
 * Profile
 */

/**
 * @deprecated
 */
export const navigateToEmailForwardingPreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING
    })
  );

/**
 * @deprecated
 */
export const navigateToServicePreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PROFILE_PREFERENCES_SERVICES
    })
  );

/**
 * @deprecated
 */
export const navigateToCalendarPreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PROFILE_PREFERENCES_CALENDAR
    })
  );

/**
 * @deprecated
 */
export const navigateToLanguagePreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PROFILE_PREFERENCES_LANGUAGE
    })
  );

/**
 * @deprecated
 */
export const navigateToLogout = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PROFILE_LOGOUT
    })
  );

/**
 * @deprecated
 */
export const navigateToRemoveAccountSuccess = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PROFILE_REMOVE_ACCOUNT_SUCCESS
    })
  );

/**
 * @deprecated
 */
export const navigateToRemoveAccountDetailScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS
    })
  );

/**
 * @deprecated
 */
export const navigateToPrivacyScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PROFILE_PRIVACY_MAIN,
      action: NavigationActions.navigate({
        routeName: ROUTES.PROFILE_PRIVACY_MAIN
      })
    })
  );

/**
 * @deprecated
 */
export const navigateToPrivacyShareData = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PROFILE_PRIVACY_SHARE_DATA
    })
  );

/**
 * Wallet & Payments
 */

/**
 * @deprecated
 */
export const navigateToPaymentTransactionSummaryScreen = (
  params: InferNavigationParams<typeof TransactionSummaryScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentTransactionErrorScreen = (
  params: InferNavigationParams<typeof TransactionErrorScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_TRANSACTION_ERROR,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentPickPaymentMethodScreen = (
  params: InferNavigationParams<typeof PickPaymentMethodScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_PICK_PAYMENT_METHOD,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToTransactionSuccessScreen = (
  params: InferNavigationParams<typeof TransactionSuccessScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_TRANSACTION_SUCCESS,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToTransactionDetailsScreen = (
  params: InferNavigationParams<typeof TransactionDetailsScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_TRANSACTION_DETAILS,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToCreditCardDetailScreen = (
  params: InferNavigationParams<typeof CreditCardDetailScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_CREDIT_CARD_DETAIL,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToBancomatDetailScreen = (
  bancomat: BancomatPaymentMethod
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_BANCOMAT_DETAIL,
      params: { bancomat }
    })
  );

/**
 * @deprecated
 */
export const navigateToSatispayDetailScreen = (
  satispay: SatispayPaymentMethod
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_SATISPAY_DETAIL,
      params: { satispay }
    })
  );

/**
 * @deprecated
 */
export const navigateToBPayDetailScreen = (bPay: BPayPaymentMethod) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_BPAY_DETAIL,
      params: { bPay }
    })
  );

/**
 * @deprecated
 */
export const navigateToCobadgeDetailScreen = (
  cobadge: CreditCardPaymentMethod
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_COBADGE_DETAIL,
      params: { cobadge }
    })
  );

/**
 * @deprecated
 */
export const navigateToPrivativeDetailScreen = (
  privative: PrivativePaymentMethod
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_PRIVATIVE_DETAIL,
      params: { privative }
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentPickPspScreen = (
  params: InferNavigationParams<typeof PickPspScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_PICK_PSP,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentConfirmPaymentMethodScreen = (
  params: InferNavigationParams<typeof ConfirmPaymentMethodScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentHistoryDetail = (
  params: InferNavigationParams<typeof PaymentHistoryDetailsScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_HISTORY_DETAIL_INFO,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToCreditCardOnboardingAttempt = (
  params: InferNavigationParams<typeof CreditCardOnboardingAttemptDetailScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPT_DETAIL,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWalletHome = (
  params?: InferNavigationParams<typeof WalletHomeScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_HOME,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWalletAddPaymentMethod = (
  params: InferNavigationParams<typeof AddPaymentMethodScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_ADD_PAYMENT_METHOD,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWalletAddDigitalPaymentMethod = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_ADD_DIGITAL_PAYMENT_METHOD
    })
  );

/**
 * @deprecated
 */
export const navigateToWalletAddCreditCard = (
  params: InferNavigationParams<typeof AddCardScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_ADD_CARD,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWalletConfirmCardDetails = (
  params: InferNavigationParams<typeof ConfirmCardDetailsScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WALLET_CONFIRM_CARD_DETAILS,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentScanQrCode = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_SCAN_QR_CODE
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentManualDataInsertion = (
  params?: InferNavigationParams<typeof ManualDataInsertionScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_MANUAL_DATA_INSERTION,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToAddCreditCardOutcomeCode = (
  params: InferNavigationParams<typeof AddCreditCardOutcomeCodeMessage>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.ADD_CREDIT_CARD_OUTCOMECODE_MESSAGE,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentOutcomeCode = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.PAYMENT_OUTCOMECODE_MESSAGE
    })
  );

/**
 * CIE
 */

/**
 * @deprecated
 */
export const navigateToCieInvalidScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.CIE_EXPIRED_SCREEN
    })
  );

/**
 * @deprecated
 */
export const navigateToCiePinScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.CIE_PIN_SCREEN
    })
  );

/**
 * @deprecated
 */
export const navigateToCieCardReaderScreen = (
  params?: InferNavigationParams<typeof CieCardReaderScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.CIE_CARD_READER_SCREEN,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWorkunitGenericFailureScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.WORKUNIT_GENERIC_FAILURE
    })
  );

/**
 * SPID
 */
/**
 * @deprecated
 */
export const navigateToSPIDTestIDP = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.AUTHENTICATION_IDP_TEST
    })
  );

/**
 * @deprecated
 */
export const navigateToSPIDLogin = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: ROUTES.AUTHENTICATION_IDP_LOGIN
    })
  );
