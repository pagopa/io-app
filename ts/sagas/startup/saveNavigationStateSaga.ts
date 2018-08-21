import {
  NavigationActions,
  NavigationParams,
  NavigationStateRoute
} from "react-navigation";
import { Effect } from "redux-saga";
import { put, select } from "redux-saga/effects";

import ROUTES from "../../navigation/routes";

import { deferToLogin } from "../../store/actions/deferred";
import { navigationStateSelector } from "../../store/reducers/navigation";

/**
 * Saves the navigation state in a deferred navigation action so that when
 * the app  goes through the initialization saga, the user gets sent back
 * to the saved  navigation route.
 * Saving and restoring routes relies on the deferred actions mechanism.
 */
export function* saveNavigationStateSaga(): IterableIterator<Effect> {
  const navigationState: ReturnType<
    typeof navigationStateSelector
  > = yield select(navigationStateSelector);
  const currentRoute = navigationState.routes[
    navigationState.index
  ] as NavigationStateRoute<NavigationParams>;
  if (currentRoute.routes && currentRoute.routeName === ROUTES.MAIN) {
    // only save state when in Main navigator
    const mainSubRoute = currentRoute.routes[currentRoute.index];
    yield put(
      deferToLogin(
        NavigationActions.navigate({
          routeName: mainSubRoute.routeName,
          params: mainSubRoute.params,
          key: mainSubRoute.key
        })
      )
    );
  }
}
