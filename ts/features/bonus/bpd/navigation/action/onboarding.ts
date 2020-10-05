import { NavigationActions } from "react-navigation";
import BPD_ROUTES from "../routes";

export const navigateToBpdOnboardingLoadActivationStatus = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS
  });

export const navigateToBpdOnboardingInformationTos = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.INFORMATION_TOS
  });

export const navigateToBpdOnboardingDeclaration = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.DECLARATION
  });

export const navigateToBpdOnboardingLoadActivate = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD
  });

export const navigateToBpdOnboardingEnrollPaymentMethod = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.ENROLL_PAYMENT_METHODS
  });

export const navigateToBpdOnboardingNoPaymentMethods = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.NO_PAYMENT_METHODS
  });
