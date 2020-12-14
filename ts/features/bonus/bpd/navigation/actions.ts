import { NavigationActions } from "react-navigation";
import { BpdPeriodAmount } from "../store/reducers/details/combiner";
import BPD_ROUTES from "./routes";

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

export const navigateToBpdOnboardingErrorPaymentMethods = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.ERROR_PAYMENT_METHODS
  });

// IBAN
export const navigateToBpdIbanInsertion = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.IBAN
  });

// Details

export const navigateToBpdDetails = (specificPeriod?: BpdPeriodAmount) =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.DETAILS,
    params: { specificPeriod }
  });

// Transactions
export const navigateToBpdTransactions = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.TRANSACTIONS
  });
