import {
  NavigationAction,
  NavigationActions,
  NavigationResetAction,
  NavigationState,
  StackActions
} from "react-navigation";
import { ActionType, createStandardAction } from "typesafe-actions";
import BonusInformationScreen from "../../features/bonusVacanze/screens/BonusInformationScreen";
import ROUTES from "../../navigation/routes";
import CieCardReaderScreen from "../../screens/authentication/cie/CieCardReaderScreen";
import { MessageDetailScreen } from "../../screens/messages/MessageDetailScreen";
import FingerprintScreen from "../../screens/onboarding/FingerprintScreen";
import ServiceDetailsScreen from "../../screens/services/ServiceDetailsScreen";
import AddCardScreen from "../../screens/wallet/AddCardScreen";
import AddPaymentMethodScreen from "../../screens/wallet/AddPaymentMethodScreen";
import ConfirmCardDetailsScreen from "../../screens/wallet/ConfirmCardDetailsScreen";
import ConfirmPaymentMethodScreen from "../../screens/wallet/payment/ConfirmPaymentMethodScreen";
import ManualDataInsertionScreen from "../../screens/wallet/payment/ManualDataInsertionScreen";
import PickPaymentMethodScreen from "../../screens/wallet/payment/PickPaymentMethodScreen";
import PickPspScreen from "../../screens/wallet/payment/PickPspScreen";
import TransactionErrorScreen from "../../screens/wallet/payment/TransactionErrorScreen";
import TransactionSuccessScreen from "../../screens/wallet/payment/TransactionSuccessScreen";
import TransactionSummaryScreen from "../../screens/wallet/payment/TransactionSummaryScreen";
import PaymentHistoryDetailsScreen from "../../screens/wallet/PaymentHistoryDetailsScreen";
import TransactionDetailsScreen from "../../screens/wallet/TransactionDetailsScreen";
import TransactionsScreen from "../../screens/wallet/TransactionsScreen";
import WalletHomeScreen from "../../screens/wallet/WalletHomeScreen";
import { InferNavigationParams } from "../../types/react";

export const navigationRestore = createStandardAction("NAVIGATION_RESTORE")<
  NavigationState
>();

export type NavigationActions =
  | NavigationAction
  | ActionType<typeof navigationRestore>;

export const resetToAuthenticationRoute: NavigationResetAction = StackActions.reset(
  {
    index: 0,
    key: null,
    actions: [
      NavigationActions.navigate({
        routeName: ROUTES.AUTHENTICATION
      })
    ]
  }
);

export const navigateToMainNavigatorAction = StackActions.reset({
  key: "StackRouterRoot",
  index: 0,
  actions: [
    NavigationActions.navigate({
      routeName: ROUTES.MAIN
    })
  ]
});

export const navigateBack = NavigationActions.back;

/**
 * Authentication
 */

export const navigateToIdpSelectionScreenAction = NavigationActions.navigate({
  routeName: ROUTES.AUTHENTICATION,
  action: NavigationActions.navigate({
    routeName: ROUTES.AUTHENTICATION_IDP_SELECTION
  })
});

export const navigateToOnboardingPinScreenAction = NavigationActions.navigate({
  routeName: ROUTES.ONBOARDING,
  action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_PIN })
});

export const navigateToOnboardingFingerprintScreenAction = (
  params: InferNavigationParams<typeof FingerprintScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.ONBOARDING_FINGERPRINT,
    params
  });

export const navigateToTosScreen = NavigationActions.navigate({
  routeName: ROUTES.ONBOARDING,
  action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_TOS })
});

/**
 * Email
 */

export const navigateToEmailReadScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.READ_EMAIL_SCREEN
  });

export const navigateToEmailInsertScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.INSERT_EMAIL_SCREEN
  });

/**
 * Message
 */

export const navigateToMessageDetailScreenAction = (
  params: InferNavigationParams<typeof MessageDetailScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.MESSAGE_DETAIL,
    params
  });

/**
 * Service
 */

export const navigateToServiceDetailsScreen = (
  params: InferNavigationParams<typeof ServiceDetailsScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.SERVICE_DETAIL,
    params
  });

/**
 * Profile
 */

export const navigateToFingerprintPreferenceScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.PROFILE_PREFERENCES_BIOMETRIC_RECOGNITION
  });

export const navigateToEmailForwardingPreferenceScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.PROFILE_PREFERENCES_EMAIL_FORWARDING
  });

export const navigateToCalendarPreferenceScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.PROFILE_PREFERENCES_CALENDAR
  });

export const navigateToLanguagePreferenceScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.PROFILE_PREFERENCES_LANGUAGE
  });

/**
 * Wallet & Payments
 */

export const navigateToPaymentTransactionSummaryScreen = (
  params: InferNavigationParams<typeof TransactionSummaryScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
    params
  });

export const navigateToPaymentTransactionErrorScreen = (
  params: InferNavigationParams<typeof TransactionErrorScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_TRANSACTION_ERROR,
    params
  });

export const navigateToPaymentPickPaymentMethodScreen = (
  params: InferNavigationParams<typeof PickPaymentMethodScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_PICK_PAYMENT_METHOD,
    params
  });

export const navigateToTransactionSuccessScreen = (
  params: InferNavigationParams<typeof TransactionSuccessScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_TRANSACTION_SUCCESS,
    params
  });

export const navigateToTransactionDetailsScreen = (
  params: InferNavigationParams<typeof TransactionDetailsScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_TRANSACTION_DETAILS,
    params
  });

export const navigateToWalletTransactionsScreen = (
  params: InferNavigationParams<typeof TransactionsScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_CARD_TRANSACTIONS,
    params
  });

export const navigateToPaymentPickPspScreen = (
  params: InferNavigationParams<typeof PickPspScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_PICK_PSP,
    params
  });

export const navigateToPaymentConfirmPaymentMethodScreen = (
  params: InferNavigationParams<typeof ConfirmPaymentMethodScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD,
    params
  });

export const navigateToPaymentHistoryDetail = (
  params: InferNavigationParams<typeof PaymentHistoryDetailsScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_HISTORY_DETAIL_INFO,
    params
  });

export const navigateToWalletHome = (
  params?: InferNavigationParams<typeof WalletHomeScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_HOME,
    params
  });

export const navigateToWalletList = () =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_LIST
  });

export const navigateToWalletAddPaymentMethod = (
  params: InferNavigationParams<typeof AddPaymentMethodScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_ADD_PAYMENT_METHOD,
    params
  });

export const navigateToWalletAddCreditCard = (
  params: InferNavigationParams<typeof AddCardScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_ADD_CARD,
    params
  });

export const navigateToWalletConfirmCardDetails = (
  params: InferNavigationParams<typeof ConfirmCardDetailsScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_CONFIRM_CARD_DETAILS,
    params
  });

export const navigateToPaymentScanQrCode = () =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_SCAN_QR_CODE
  });

export const navigateToPaymentManualDataInsertion = (
  params?: InferNavigationParams<typeof ManualDataInsertionScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_MANUAL_DATA_INSERTION,
    params
  });

/**
 * CIE
 */

export const navigateToCieInvalidScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.CIE_EXPIRED_SCREEN
  });

export const navigateToCiePinScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.CIE_PIN_SCREEN
  });

export const navigateToCieCardReaderScreen = (
  params?: InferNavigationParams<typeof CieCardReaderScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.CIE_CARD_READER_SCREEN,
    params
  });

/**
 * BONUS
 */
export const navigateToAvailableBonusScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.BONUS_AVAILABLE_LIST
  });

export const navigateToBonusRequestInformation = (
  params?: InferNavigationParams<typeof BonusInformationScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.BONUS_REQUEST_INFORMATION,
    params
  });

export const navigateToBonusTosScreen = () =>
  NavigationActions.navigate({
    routeName: ROUTES.BONUS_TOS_SCREEN
  });
