import { NavigationActions } from "react-navigation";
import CGN_ROUTES from "./routes";

export const navigateToCgnOnboardingLoadActivationStatus = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.LOAD_CHECK_ACTIVATION_STATUS
  });

export const navigateToCgnOnboardingInformationTos = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.INFORMATION_TOS
  });

export const navigateToCgnOnboardingLoadActivate = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.LOAD_ACTIVATE
  });

// Details
export const navigateToCgnDetails = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.DETAILS
  });
