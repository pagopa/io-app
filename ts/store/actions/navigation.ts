import {
  NavigationAction,
  NavigationActions,
  NavigationResetAction,
  NavigationState,
  StackActions
} from "react-navigation";
import { ActionType, createStandardAction } from "typesafe-actions";

import ROUTES from "../../navigation/routes";

export const navigationRestore = createStandardAction("NAVIGATION_RESTORE")<
  NavigationState
>();

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

export const navigateToMainNavigatorAction = StackActions.reset({
  key: "StackRouterRoot",
  index: 0,
  actions: [
    NavigationActions.navigate({
      routeName: ROUTES.MAIN
    })
  ]
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

export const navigateBack = NavigationActions.back;

export const navigateToMessageDetailScreenAction = (messageId: string) =>
  StackActions.reset({
    key: "StackRouterRoot",
    index: 0,
    actions: [
      NavigationActions.navigate({
        routeName: ROUTES.MAIN,
        action: NavigationActions.navigate({
          routeName: ROUTES.MESSAGES_NAVIGATOR,
          action: NavigationActions.navigate({
            routeName: ROUTES.MESSAGE_DETAIL,
            params: {
              messageId
            }
          })
        })
      })
    ]
  });

export type NavigationActions =
  | NavigationAction
  | ActionType<typeof navigationRestore>;
