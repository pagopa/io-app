import { NavigationActions } from "react-navigation";
import CGN_ROUTES from "./routes";

export const navigateToBpdOnboardingLoadActivationStatus = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.LOAD_CHECK_ACTIVATION_STATUS
  });

export const navigateToBpdOnboardingInformationTos = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.INFORMATION_TOS
  });

export const navigateToBpdOnboardingLoadActivate = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.LOAD_ACTIVATE
  });

// Details
export const navigateToBpdDetails = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.DETAILS
  });
