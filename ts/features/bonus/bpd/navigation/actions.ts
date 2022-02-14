import { NavigationActions } from "react-navigation";
import NavigationService from "../../../../navigation/NavigationService";
import { BpdPeriodWithInfo } from "../store/reducers/details/periods";
import BPD_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingLoadActivationStatus = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingInformationTos = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.ONBOARDING.INFORMATION_TOS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingDeclaration = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.ONBOARDING.DECLARATION
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingLoadActivate = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingEnrollPaymentMethod = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.ONBOARDING.ENROLL_PAYMENT_METHODS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingNoPaymentMethods = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.ONBOARDING.NO_PAYMENT_METHODS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdOnboardingErrorPaymentMethods = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.ONBOARDING.ERROR_PAYMENT_METHODS
    })
  );

// IBAN

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdIbanInsertion = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.IBAN
    })
  );

// Details

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdDetails = (specificPeriod?: BpdPeriodWithInfo) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.DETAILS,
      params: { specificPeriod }
    })
  );

// Transactions

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBpdTransactions = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BPD_ROUTES.TRANSACTIONS
    })
  );

// Opt-in
export const navigateToOptInPaymentMethodsThankYouDeleteMethodsScreen = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.THANK_YOU_DELETE_METHOD
  });

export const navigateToOptInPaymentMethodsThankYouKeepMethodsScreen = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.THANK_YOU_KEEP_METHOD
  });
