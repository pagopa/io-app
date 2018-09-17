import {
  NavigationAction,
  NavigationActions,
  NavigationResetAction,
  NavigationState,
  StackActions
} from "react-navigation";

import { NAVIGATION_RESTORE } from "./constants";

import ROUTES from "../../navigation/routes";

// Actions

type NavigationRestore = Readonly<{
  type: typeof NAVIGATION_RESTORE;
  payload: NavigationState;
}>;

export type NavigationActions = NavigationAction | NavigationRestore;

// Creators

export const resetToAuthenticationRoute: NavigationResetAction = StackActions.reset(
  {
    index: 0,
    key: null,
    actions: [
      NavigationActions.navigate({
        routeName: ROUTES.AUTHENTICATION
      })
    ]
  }
);

export const navigateToMainNavigatorAction = (prevRouteKey: string) =>
  StackActions.replace({
    routeName: ROUTES.MAIN,
    key: prevRouteKey
  });

export const navigateToOnboardingPinScreenAction = NavigationActions.navigate({
  routeName: ROUTES.ONBOARDING,
  action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_PIN })
});

export const navigateToTosScreen = NavigationActions.navigate({
  routeName: ROUTES.ONBOARDING,
  action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_TOS })
});

export const navigateToPinLogin = NavigationActions.navigate({
  routeName: ROUTES.PIN_LOGIN,
  key: undefined
});

export const navigateToBackgroundScreen = NavigationActions.navigate({
  routeName: ROUTES.BACKGROUND
});
