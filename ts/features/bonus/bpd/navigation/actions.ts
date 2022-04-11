import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { BpdPeriodWithInfo } from "../store/reducers/details/periods";
import BPD_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingLoadActivationStatus = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.ONBOARDING.MAIN,
      params: {
        screen: BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingInformationTos = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.ONBOARDING.MAIN,
      params: {
        screen: BPD_ROUTES.ONBOARDING.INFORMATION_TOS
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingDeclaration = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.ONBOARDING.MAIN,
      params: {
        screen: BPD_ROUTES.ONBOARDING.DECLARATION
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingLoadActivate = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.ONBOARDING.MAIN,
      params: {
        screen: BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingEnrollPaymentMethod = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.ONBOARDING.MAIN,
      params: {
        screen: BPD_ROUTES.ONBOARDING.ENROLL_PAYMENT_METHODS
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingNoPaymentMethods = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.ONBOARDING.MAIN,
      params: {
        screen: BPD_ROUTES.ONBOARDING.NO_PAYMENT_METHODS
      }
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingErrorPaymentMethods = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.ONBOARDING.MAIN,
      params: {
        screen: BPD_ROUTES.ONBOARDING.ERROR_PAYMENT_METHODS
      }
    })
  );

// IBAN

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdIbanInsertion = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.IBAN
    })
  );

// Details

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdDetails = (specificPeriod?: BpdPeriodWithInfo) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.DETAILS_MAIN,
      params: {
        screen: BPD_ROUTES.DETAILS,
        params: { specificPeriod }
      }
    })
  );

// Transactions

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdTransactions = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: BPD_ROUTES.DETAILS_MAIN,
      params: {
        screen: BPD_ROUTES.TRANSACTIONS
      }
    })
  );

// OPT-IN
export const navigateToOptInPaymentMethodsChoiceScreen = () =>
  CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
    screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.MAIN,
    params: {
      screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CHOICE
    }
  });

export const navigateToOptInPaymentMethodsThankYouDeleteMethodsScreen = () =>
  CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
    screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.MAIN,
    params: {
      screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.THANK_YOU_DELETE_METHOD
    }
  });

export const navigateToOptInPaymentMethodsThankYouKeepMethodsScreen = () =>
  CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
    screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.MAIN,
    params: {
      screen: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.THANK_YOU_KEEP_METHOD
    }
  });
