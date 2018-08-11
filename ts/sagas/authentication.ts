import { NavigationActions, StackActions } from "react-navigation";
import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";

import ROUTES from "../navigation/routes";
import {
  analyticsAuthenticationCompleted,
  analyticsAuthenticationStarted
} from "../store/actions/analytics";
import { LOGIN_SUCCESS } from "../store/actions/constants";

/**
 * A saga that manages the user authentication.
 */
export function* authenticationSaga(): Iterator<Effect> {
  yield put(analyticsAuthenticationStarted);

  // Reset the navigation stack and navigate to the authentication screen
  yield put(
    StackActions.reset({
      index: 0,
      key: null,
      actions: [
        NavigationActions.navigate({
          routeName: ROUTES.AUTHENTICATION
        })
      ]
    })
  );

  // Wait until the user has successfully logged in with SPID
  yield take(LOGIN_SUCCESS);

  // User logged in successfully dispatch an AUTHENTICATION_COMPLETED action.
  // FIXME: what's the difference between AUTHENTICATION_COMPLETED and
  //        LOGIN_SUCCESS?
  yield put(analyticsAuthenticationCompleted);
}
