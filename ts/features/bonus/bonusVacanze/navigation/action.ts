import { NavigationActions } from "react-navigation";
import NavigationService from "../../../../navigation/NavigationService";
import { InferNavigationParams } from "../../../../types/react";
import ActiveBonusScreen from "../screens/ActiveBonusScreen";
import BonusInformationScreen from "../screens/BonusInformationScreen";
import BONUSVACANZE_ROUTES from "./routes";

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBonusEligibilityLoading = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK_LOADING
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToIseeNotEligible = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_ELIGIBLE
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToIseeNotAvailable = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_AVAILABLE
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToEligible = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ELIGIBLE
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToTimeoutEligibilityCheck = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.TIMEOUT
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBonusActivationPending = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.PENDING
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToUnderage = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.UNDERAGE
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToAvailableBonusScreen = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBonusRequestInformation = (
  params?: InferNavigationParams<typeof BonusInformationScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.BONUS_REQUEST_INFORMATION,
      params
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBonusActiveDetailScreen = (
  params?: InferNavigationParams<typeof ActiveBonusScreen>
) =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.BONUS_ACTIVE_DETAIL_SCREEN,
      params
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBonusActivationLoading = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ACTIVATION.LOADING
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBonusActivationTimeout = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ACTIVATION.TIMEOUT
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBonusAlreadyExists = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ACTIVATION.EXISTS
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToEligibilityExpired = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ACTIVATION.ELIGIBILITY_EXPIRED
    })
  );

/**
 * @deprecated Do not use this method when you have access to a navigation prop or useNavigation since it will behave differently,
 * and many helper methods specific to screens won't be available.
 */
export const navigateToBonusActivationCompleted = () =>
  NavigationService.dispatchNavigationAction(
    NavigationActions.navigate({
      routeName: BONUSVACANZE_ROUTES.ACTIVATION.COMPLETED
    })
  );
