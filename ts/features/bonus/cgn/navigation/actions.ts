import { NavigationActions } from "react-navigation";
import CGN_ROUTES from "./routes";

export const navigateToCgnActivationLoadActivationStatus = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.LOAD_CHECK_ACTIVATION_STATUS
  });

export const navigateToCgnActivationInformationTos = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.INFORMATION_TOS
  });

export const navigateToCgnActivationLoading = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.LOADING
  });

export const navigateToCgnActivationPending = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.PENDING
  });

export const navigateToCgnActivationTimeout = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.TIMEOUT
  });

export const navigateToCgnActivationIneligible = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.INELIGIBLE
  });

export const navigateToCgnActivationCompleted = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.ACTIVATION.COMPLETED
  });

// Details
export const navigateToCgnDetails = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.DETAILS
  });

// Merchants
export const navigateToCgnMerchantsList = () =>
  NavigationActions.navigate({
    routeName: CGN_ROUTES.MERCHANTS.LIST
  });
