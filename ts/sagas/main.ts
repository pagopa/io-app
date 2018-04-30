import { NavigationActions } from "react-navigation";
import { Effect, put, takeLatest } from "redux-saga/effects";

import ROUTES from "../navigation/routes";
import { ONBOARDING_CHECK_COMPLETE } from "../store/actions/constants";

function* mainSaga(): Iterator<Effect> {
  // Navigate to the MainNavigator
  const navigateToMainNavigatorAction = NavigationActions.navigate({
    routeName: ROUTES.MAIN,
    key: null
  });
  yield put(navigateToMainNavigatorAction);
}

export default function* root(): Iterator<Effect> {
  /**
   * The Main saga need to be started only after the Onboarding saga is fully finished.
   * The ONBOARDING_CHECK_COMPLETE action is dispatched only when all the steps of the Onboarding are fulfilled.
   */
  yield takeLatest(ONBOARDING_CHECK_COMPLETE, mainSaga);
}
