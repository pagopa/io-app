import {
  NavigationParams,
  NavigationState,
  NavigationStateRoute
} from "react-navigation";
import { Effect } from "redux-saga";
import { put, select } from "redux-saga/effects";

import ROUTES from "../../navigation/routes";

import { setDeepLink } from "../../store/actions/deepLink";
import { navigationStateSelector } from "../../store/reducers/navigation";

/**
 * Saves the navigation state in the deep link state so that when the app
 * goes through the initialization saga, the user gets sent back to the saved
 * navigation route.
 * Saving and restoring routes relies on the deep link mechanism.
 */
export function* saveNavigationStateSaga(): IterableIterator<Effect> {
  const navigationState: NavigationState = yield select(
    navigationStateSelector
  );
  const currentRoute = navigationState.routes[
    navigationState.index
  ] as NavigationStateRoute<NavigationParams>;
  if (currentRoute.routes && currentRoute.routeName === ROUTES.MAIN) {
    // only save state when in Main navigator
    const mainSubRoute = currentRoute.routes[currentRoute.index];
    yield put(
      setDeepLink({
        routeName: mainSubRoute.routeName,
        params: mainSubRoute.params,
        key: mainSubRoute.key
      })
    );
  }
}
