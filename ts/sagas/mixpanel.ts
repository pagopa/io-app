import { call, select, take } from "typed-redux-saga/macro";
import { CommonActions, StackActions } from "@react-navigation/native";
import { ActionType } from "typesafe-actions";
import { initializeMixPanel, terminateMixpanel } from "../mixpanel";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import { isMixpanelEnabled } from "../store/reducers/persistedPreferences";
import { ReduxSagaEffect } from "../types/utils";

export function* initMixpanel(): Generator<ReduxSagaEffect, void, boolean> {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> =
    yield* select(isMixpanelEnabled);

  if (isMixpanelEnabledResult ?? true) {
    // initialize mixpanel
    yield* call(initializeMixPanel);
  }
}

export function* handleSetMixpanelEnabled(
  action: ActionType<typeof setMixpanelEnabled>
) {
  if (action.payload) {
    yield* call(initializeMixPanel);
  } else {
    yield* call(terminateMixpanel);
  }
}

/**
 * check, and eventually ask, about mixpanel opt-in
 */
export function* askMixpanelOptIn() {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> =
    yield* select(isMixpanelEnabled);
  // user already express a preference
  // do nothing
  if (isMixpanelEnabledResult !== null) {
    return;
  }
  // navigate to the screen where user can opt-in or not his preference
  // wait until he/she done a choice
  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate({
      name: ROUTES.ONBOARDING,
      params: {
        screen: ROUTES.ONBOARDING_SHARE_DATA
      }
    })
  );
  yield* take(setMixpanelEnabled);
  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.popToTop()
  );
}
