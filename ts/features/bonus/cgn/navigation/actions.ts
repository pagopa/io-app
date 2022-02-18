import { NavigationActions } from "react-navigation";
import NavigationService from "../../../../navigation/NavigationService";
import { InferNavigationParams } from "../../../../types/react";
import CgnMerchantDetailScreen from "../screens/merchants/CgnMerchantDetailScreen";
import CgnMerchantLandingWebview from "../screens/merchants/CgnMerchantLandingWebview";
import CGN_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationInformationTos = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.ACTIVATION.INFORMATION_TOS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationLoading = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.ACTIVATION.LOADING
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToEycaActivationLoading = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.EYCA.ACTIVATION.LOADING
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnAlreadyActive = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.ACTIVATION.EXISTS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationPending = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.ACTIVATION.PENDING
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationTimeout = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.ACTIVATION.TIMEOUT
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationIneligible = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.ACTIVATION.INELIGIBLE
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationCompleted = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.ACTIVATION.COMPLETED
    })
  );

// Details

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnDetails = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.DETAILS.DETAILS
    })
  );

// Merchants
/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnMerchantsList = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.DETAILS.MERCHANTS.LIST
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnMerchantsTabs = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.DETAILS.MERCHANTS.TABS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnMerchantDetail = (
  params: InferNavigationParams<typeof CgnMerchantDetailScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.DETAILS.MERCHANTS.DETAIL,
      params
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnMerchantLandingWebview = (
  params: InferNavigationParams<typeof CgnMerchantLandingWebview>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: CGN_ROUTES.DETAILS.MERCHANTS.LANDING_WEBVIEW,
      params
    })
  );
