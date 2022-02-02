import { NavigationParams, NavigationStateRoute } from "react-navigation";
import { call, Effect, put } from "typed-redux-saga";
import NavigationService from "../../navigation/NavigationService";

import ROUTES from "../../navigation/routes";

import { setDeepLink } from "../../store/actions/deepLink";

/**
 * Saves the navigation state in the deep link state so that when the app
 * goes through the initialization saga, the user gets sent back to the saved
 * navigation route.
 * Saving and restoring routes relies on the deep link mechanism.
 */
export function* saveNavigationStateSaga(): Generator<
  Effect,
  void,
  ReturnType<typeof NavigationService.getCurrentRoute>
> {
  const currentScreen: ReturnType<typeof NavigationService.getCurrentRoute> =
    yield* call(NavigationService.getCurrentRoute);

  if (currentScreen) {
    const currentRoute = currentScreen.routes[
      currentScreen.index
    ] as NavigationStateRoute<NavigationParams>;
    if (currentRoute.routes && currentRoute.routeName === ROUTES.MAIN) {
      // only save state when in Main navigator
      const mainSubRoute = currentRoute.routes[currentRoute.index];
      yield* put(
        setDeepLink({
          routeName: mainSubRoute.routeName,
          params: mainSubRoute.params,
          key: mainSubRoute.key
        })
      );
    }
  }
}
