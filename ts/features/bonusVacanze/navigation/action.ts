import { NavigationActions } from "react-navigation";
import { InferNavigationParams } from "../../../types/react";
import ActiveBonusScreen from "../screens/ActiveBonusScreen";
import BonusInformationScreen from "../screens/BonusInformationScreen";
import BONUSVACANZE_ROUTES from "./routes";

export const navigateToBonusEligibilityLoading = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK_LOADING
  });

export const navigateToIseeNotEligible = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_ELIGIBLE
  });

export const navigateToIseeNotAvailable = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ISEE_NOT_AVAILABLE
  });

export const navigateToActivateBonus = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ACTIVATION_REQUEST
  });

export const navigateToTimeoutEligibilityCheck = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.TIMEOUT
  });

export const navigateToAvailableBonusScreen = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST
  });

export const navigateToBonusRequestInformation = (
  params?: InferNavigationParams<typeof BonusInformationScreen>
) =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.BONUS_REQUEST_INFORMATION,
    params
  });

export const navigateToBonusTosScreen = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.BONUS_TOS_SCREEN
  });

export const navigateToBonusActiveDetailScreen = (
  params?: InferNavigationParams<typeof ActiveBonusScreen>
) =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.BONUS_ACTIVE_DETAIL_SCREEN,
    params
  });

export const navigateToActivationLoading = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ACTIVATION_LOADING
  });

export const navigateToActivationTimeout = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ACTIVATION_TIMEOUT
  });

export const navigateToActivationCompleted = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ACTIVATION_COMPLETED
  });
