import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../navigation/NavigationService";
import { CgnMerchantDetailScreenNavigationParams } from "../screens/merchants/CgnMerchantDetailScreen";
import { CgnMerchantLandingWebviewNavigationParams } from "../screens/merchants/CgnMerchantLandingWebview";
import CGN_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationInformationTos = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.INFORMATION_TOS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationLoading = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.LOADING
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToEycaActivationLoading = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.EYCA.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.EYCA.ACTIVATION.LOADING
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnAlreadyActive = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.EXISTS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationPending = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.PENDING
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationTimeout = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.TIMEOUT
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationIneligible = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.INELIGIBLE
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationCompleted = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.COMPLETED
    })
  );

// Details

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnDetails = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.DETAILS
    })
  );

// Merchants
/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnMerchantsList = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.MERCHANTS.LIST
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnMerchantsTabs = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.MERCHANTS.TABS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnMerchantDetail = (
  params: CgnMerchantDetailScreenNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.MERCHANTS.DETAIL,
      params
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToCgnMerchantLandingWebview = (
  params: CgnMerchantLandingWebviewNavigationParams
) =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.MERCHANTS.LANDING_WEBVIEW,
      params
    })
  );
