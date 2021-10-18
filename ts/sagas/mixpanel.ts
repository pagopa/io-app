import { call, Effect, put, select, take } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { NavigationActions } from "react-navigation";
import { initializeMixPanel, terminateMixpanel } from "../mixpanel";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import { isMixpanelEnabled } from "../store/reducers/persistedPreferences";
import ROUTES from "../navigation/routes";

export function* initMixpanel(): Generator<Effect, void, boolean> {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> =
    yield select(isMixpanelEnabled);

  if (isMixpanelEnabledResult ?? true) {
    // initialize mixpanel
    yield call(initializeMixPanel);
  }
}

export function* handleSetMixpanelEnabled(
  action: ActionType<typeof setMixpanelEnabled>
) {
  if (action.payload) {
    yield call(initializeMixPanel);
  } else {
    yield call(terminateMixpanel);
  }
}

/**
 * check, and eventually ask, about mixpanel opt-in
 */
export function* askMixpanelOptIn() {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> =
    yield select(isMixpanelEnabled);
  // user already express a preference
  // do nothing
  if (isMixpanelEnabledResult !== null) {
    return;
  }
  // navigate to the screen where user can opt-in or not his preference
  // wait until he/she done a choice
  yield put(
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_SHARE_DATA
    })
  );
  yield take(setMixpanelEnabled);
}
