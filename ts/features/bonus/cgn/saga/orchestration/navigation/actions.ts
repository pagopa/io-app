import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../../../../navigation/NavigationService";
import CGN_ROUTES from "../../../navigation/routes";

/**
 * NOTE: Do not use this method when you have access to a navigation prop or useNavigation.
 * It will behave differently, and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationInformationTos = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.INFORMATION_TOS
    })
  );

/**
 * NOTE: Do not use this method when you have access to a navigation prop or useNavigation.
 * It will behave differently, and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationLoading = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.LOADING
    })
  );

/**
 * NOTE: Do not use this method when you have access to a navigation prop or useNavigation.
 * It will behave differently, and many helper methods specific to screens won't be available.
 */
export const navigateToEycaActivationLoading = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.EYCA.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.EYCA.ACTIVATION.LOADING
    })
  );

/**
 * NOTE: Do not use this method when you have access to a navigation prop or useNavigation.
 * It will behave differently, and many helper methods specific to screens won't be available.
 */
export const navigateToCgnAlreadyActive = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.EXISTS
    })
  );

/**
 * NOTE: Do not use this method when you have access to a navigation prop or useNavigation.
 * It will behave differently, and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationPending = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.PENDING
    })
  );

/**
 * NOTE: Do not use this method when you have access to a navigation prop or useNavigation.
 * It will behave differently, and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationTimeout = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.TIMEOUT
    })
  );

/**
 * NOTE: Do not use this method when you have access to a navigation prop or useNavigation.
 * It will behave differently, and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationIneligible = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.INELIGIBLE
    })
  );

/**
 * NOTE: Do not use this method when you have access to a navigation prop or useNavigation.
 * It will behave differently, and many helper methods specific to screens won't be available.
 */
export const navigateToCgnActivationCompleted = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.ACTIVATION.MAIN, {
      screen: CGN_ROUTES.ACTIVATION.COMPLETED
    })
  );

/**
 * NOTE: Do not use this method when you have access to a navigation prop or useNavigation.
 * It will behave differently, and many helper methods specific to screens won't be available.
 */
export const navigateToCgnDetails = () =>
  NavigationService.dispatchNavigationAction(
    CommonActions.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.DETAILS
    })
  );
