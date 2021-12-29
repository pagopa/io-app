import { NavigationActions } from "react-navigation";
import { call, Effect, select, take } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { initializeMixPanel, terminateMixpanel } from "../mixpanel";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import { isMixpanelEnabled } from "../store/reducers/persistedPreferences";
import { OPERISSUES_10_track } from "./startup";

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
  yield call(OPERISSUES_10_track, "askMixpanelOptIn_1");
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> =
    yield select(isMixpanelEnabled);
  yield call(OPERISSUES_10_track, "askMixpanelOptIn_2");
  // user already express a preference
  // do nothing
  if (isMixpanelEnabledResult !== null) {
    yield call(OPERISSUES_10_track, "askMixpanelOptIn_3");
    return;
  }
  yield call(OPERISSUES_10_track, "askMixpanelOptIn_4");
  // navigate to the screen where user can opt-in or not his preference
  // wait until he/she done a choice
  yield call(
    NavigationService.dispatchNavigationAction,
    NavigationActions.navigate({
      routeName: ROUTES.ONBOARDING_SHARE_DATA
    })
  );
  yield call(OPERISSUES_10_track, "askMixpanelOptIn_5");
  yield take(setMixpanelEnabled);
}
