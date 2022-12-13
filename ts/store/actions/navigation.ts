import { CommonActions } from "@react-navigation/native";
import { CreditCardDetailScreenNavigationParams } from "../../features/wallet/creditCard/screen/CreditCardDetailScreen";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { CieCardReaderScreenNavigationParams } from "../../screens/authentication/cie/CieCardReaderScreen";
import { MessageDetailScreenPaginatedNavigationParams } from "../../screens/messages/MessageDetailScreen";
import { MessageRouterScreenPaginatedNavigationParams } from "../../screens/messages/MessageRouterScreen";
import { FingerprintScreenNavigationParams } from "../../screens/onboarding/FingerprintScreen";
import { OnboardingServicesPreferenceScreenNavigationParams } from "../../screens/onboarding/OnboardingServicesPreferenceScreen";
import { ServiceDetailsScreenNavigationParams } from "../../screens/services/ServiceDetailsScreen";
import { AddCardScreenNavigationParams } from "../../screens/wallet/AddCardScreen";
import { AddCreditCardOutcomeCodeMessageNavigationParams } from "../../screens/wallet/AddCreditCardOutcomeCodeMessage";
import { AddPaymentMethodScreenNavigationParams } from "../../screens/wallet/AddPaymentMethodScreen";
import { ConfirmCardDetailsScreenNavigationParams } from "../../screens/wallet/ConfirmCardDetailsScreen";
import { CreditCardOnboardingAttemptDetailScreenNavigationParams } from "../../screens/wallet/creditCardOnboardingAttempts/CreditCardOnboardingAttemptDetailScreen";
import { ConfirmPaymentMethodScreenNavigationParams } from "../../screens/wallet/payment/ConfirmPaymentMethodScreen";
import { ManualDataInsertionScreenNavigationParams } from "../../screens/wallet/payment/ManualDataInsertionScreen";
import { PaymentOutcomeCodeMessageNavigationParams } from "../../screens/wallet/payment/PaymentOutcomeCodeMessage";
import { PickPaymentMethodScreenNavigationParams } from "../../screens/wallet/payment/PickPaymentMethodScreen";
import { PickPspScreenNavigationParams } from "../../screens/wallet/payment/PickPspScreen";
import { TransactionErrorScreenNavigationParams } from "../../screens/wallet/payment/TransactionErrorScreen";
import { TransactionSummaryScreenNavigationParams } from "../../screens/wallet/payment/TransactionSummaryScreen";
import { PaymentHistoryDetailsScreenNavigationParams } from "../../screens/wallet/PaymentHistoryDetailsScreen";
import { TransactionDetailsScreenNavigationParams } from "../../screens/wallet/TransactionDetailsScreen";
import { WalletHomeNavigationParams } from "../../screens/wallet/WalletHomeScreen";
import {
  BancomatPaymentMethod,
  BPayPaymentMethod,
  CreditCardPaymentMethod,
  PrivativePaymentMethod,
  SatispayPaymentMethod
} from "../../types/pagopa";

/**
 * @deprecated
 */
export const resetToAuthenticationRoute = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.reset({
      index: 0,
      routes: [{ name: ROUTES.AUTHENTICATION }]
    })
  );

/**
 * @deprecated
 */
export const navigateToMainNavigatorAction = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.reset({
      index: 0,
      routes: [{ name: ROUTES.MAIN }]
    })
  );

/**
 * @deprecated
 */
export const navigateBack = () =>
  NavigationService.dispatchNavigationAction(CommonActions.goBack());

/**
 * Authentication
 */

/**
 * @deprecated
 */
export const navigateToIdpSelectionScreenAction = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_IDP_SELECTION
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingPinScreenAction = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_PIN
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingFingerprintScreenAction = (
  params: FingerprintScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_FINGERPRINT,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToTosScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_TOS
    })
  );

/**
 * @deprecated
 */
export const navigateToOnboardingServicePreferenceCompleteAction = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE
    })
  );

/**
 * @deprecated
 */
export const navigateToServicesPreferenceModeSelectionScreen = (
  params: OnboardingServicesPreferenceScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_SERVICES_PREFERENCE,
      params
    })
  );

/**
 * Email
 */

/**
 * @deprecated
 */
export const navigateToEmailReadScreen = () => {
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.READ_EMAIL_SCREEN)
  );
};

/**
 * @deprecated
 */
export const navigateToEmailInsertScreen = () => {
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.INSERT_EMAIL_SCREEN)
  );
};

/**
 * Message
 */

/**
 * Open the Message Detail screen supporting the new UIMessage type.
 */
export const navigateToPaginatedMessageDetailScreenAction = (
  params: MessageDetailScreenPaginatedNavigationParams
) =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: ROUTES.MESSAGE_DETAIL_PAGINATED,
    params
  });

/**
 * Open the Message Detail Router supporting the new UIMessage type.
 */
export const navigateToPaginatedMessageRouterAction = (
  params: MessageRouterScreenPaginatedNavigationParams
) =>
  CommonActions.navigate(ROUTES.MESSAGES_NAVIGATOR, {
    screen: ROUTES.MESSAGE_ROUTER_PAGINATED,
    params
  });

/**
 * Service
 */

/**
 * @deprecated
 */
export const navigateToServiceHomeScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: ROUTES.SERVICES_HOME
    })
  );

/**
 * @deprecated
 */
export const navigateToServiceDetailsScreen = (
  params: ServiceDetailsScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: ROUTES.SERVICE_DETAIL,
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
    CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING
    })
  );

/**
 * @deprecated
 */
export const navigateToServicePreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_SERVICES
    })
  );

/**
 * @deprecated
 */
export const navigateToCalendarPreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_CALENDAR
    })
  );

/**
 * @deprecated
 */
export const navigateToLanguagePreferenceScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PREFERENCES_LANGUAGE
    })
  );

/**
 * @deprecated
 */
export const navigateToLogout = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_LOGOUT
    })
  );

/**
 * @deprecated
 */
export const navigateToRemoveAccountSuccess = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_REMOVE_ACCOUNT_SUCCESS
    })
  );

/**
 * @deprecated
 */
export const navigateToRemoveAccountDetailScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS
    })
  );

/**
 * @deprecated
 */
export const navigateToPrivacyScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PRIVACY_MAIN,
      params: {
        screen: ROUTES.PROFILE_PRIVACY_MAIN
      }
    })
  );

/**
 * @deprecated
 */
export const navigateToPrivacyShareData = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_PRIVACY_SHARE_DATA
    })
  );

/**
 * Wallet & Payments
 */

/**
 * @deprecated
 */
export const navigateToPaymentTransactionSummaryScreen = (
  params: TransactionSummaryScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentTransactionErrorScreen = (
  params: TransactionErrorScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_TRANSACTION_ERROR,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentPickPaymentMethodScreen = (
  params: PickPaymentMethodScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_PICK_PAYMENT_METHOD,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToTransactionDetailsScreen = (
  params: TransactionDetailsScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_TRANSACTION_DETAILS,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToCreditCardDetailScreen = (
  params: CreditCardDetailScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_CREDIT_CARD_DETAIL,
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
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_BANCOMAT_DETAIL,
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
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_SATISPAY_DETAIL,
      params: { satispay }
    })
  );

export const navigateToPayPalDetailScreen = () =>
  CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
    screen: ROUTES.WALLET_PAYPAL_DETAIL
  });

/**
 * @deprecated
 */
export const navigateToBPayDetailScreen = (bPay: BPayPaymentMethod) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_BPAY_DETAIL,
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
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_COBADGE_DETAIL,
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
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_PRIVATIVE_DETAIL,
      params: { privative }
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentPickPspScreen = (
  params: PickPspScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_PICK_PSP,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentConfirmPaymentMethodScreen = (
  params: ConfirmPaymentMethodScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentHistoryDetail = (
  params: PaymentHistoryDetailsScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_HISTORY_DETAIL_INFO,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToCreditCardOnboardingAttempt = (
  params: CreditCardOnboardingAttemptDetailScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.CREDIT_CARD_ONBOARDING_ATTEMPT_DETAIL,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWalletHome = (params?: WalletHomeNavigationParams) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.MAIN, {
      screen: ROUTES.WALLET_HOME,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWalletAddPaymentMethod = (
  params: AddPaymentMethodScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_ADD_PAYMENT_METHOD,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWalletAddCreditCard = (
  params: AddCardScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_ADD_CARD,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWalletConfirmCardDetails = (
  params: ConfirmCardDetailsScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.WALLET_CONFIRM_CARD_DETAILS,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentScanQrCode = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_SCAN_QR_CODE
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentManualDataInsertion = (
  params?: ManualDataInsertionScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_MANUAL_DATA_INSERTION,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToAddCreditCardOutcomeCode = (
  params: AddCreditCardOutcomeCodeMessageNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.ADD_CREDIT_CARD_OUTCOMECODE_MESSAGE,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToPaymentOutcomeCode = (
  params: PaymentOutcomeCodeMessageNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_OUTCOMECODE_MESSAGE,
      params
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
    CommonActions.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_EXPIRED_SCREEN
    })
  );

/**
 * @deprecated
 */
export const navigateToCiePinScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_PIN_SCREEN
    })
  );

/**
 * @deprecated
 */
export const navigateToCieCardReaderScreen = (
  params?: CieCardReaderScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_CARD_READER_SCREEN,
      params
    })
  );

/**
 * @deprecated
 */
export const navigateToWorkunitGenericFailureScreen = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WORKUNIT_GENERIC_FAILURE)
  );

/**
 * SPID
 */
/**
 * @deprecated
 */
export const navigateToSPIDTestIDP = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_IDP_TEST
    })
  );

/**
 * @deprecated
 */
export const navigateToSPIDLogin = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_IDP_LOGIN
    })
  );
