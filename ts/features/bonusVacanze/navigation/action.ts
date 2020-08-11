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

export const navigateToEligible = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.ELIGIBLE
  });

export const navigateToTimeoutEligibilityCheck = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.TIMEOUT
  });

export const navigateToBonusActivationPending = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.PENDING
  });

export const navigateToUnderage = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ELIGIBILITY.UNDERAGE
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

export const navigateToBonusActiveDetailScreen = (
  params?: InferNavigationParams<typeof ActiveBonusScreen>
) =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.BONUS_ACTIVE_DETAIL_SCREEN,
    params
  });

export const navigateToBonusActivationLoading = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ACTIVATION.LOADING
  });

export const navigateToBonusActivationTimeout = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ACTIVATION.TIMEOUT
  });

export const navigateToBonusAlreadyExists = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ACTIVATION.EXISTS
  });

export const navigateToEligibilityExpired = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ACTIVATION.ELIGIBILITY_EXPIRED
  });
export const navigateToBonusActivationCompleted = () =>
  NavigationActions.navigate({
    routeName: BONUSVACANZE_ROUTES.ACTIVATION.COMPLETED
  });
