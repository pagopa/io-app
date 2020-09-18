import { NavigationActions } from "react-navigation";
import BPD_ROUTES from "./routes";

export const navigateToBpdOnboardingLoadActivationStatus = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS
  });

export const navigateToBpdOnboardingInformationTos = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.INFORMATION_TOS
  });

export const navigateToBpdOnboardingEligibilityLoad = () =>
  NavigationActions.navigate({
    routeName: BPD_ROUTES.ONBOARDING.ELIGIBILITY_LOAD
  });
