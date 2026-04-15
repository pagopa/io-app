import { call, select, take, takeLatest, put } from "typed-redux-saga/macro";
import { CommonActions, StackActions } from "@react-navigation/native";
import { ActionType, getType } from "typesafe-actions";
import {
  identifyMixpanel,
  initializeMixPanel,
  resetMixpanel,
  terminateMixpanel
} from "../mixpanel";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import { isMixpanelEnabled } from "../store/reducers/persistedPreferences";
import { ReduxSagaEffect } from "../types/utils";
import {
  sessionExpired,
  sessionInvalid
} from "../features/authentication/common/store/actions";
import { GlobalState } from "../store/reducers/types";
import { updateMixpanelProfileProperties } from "../mixpanelConfig/profileProperties";
import { setIsMixpanelInitialized } from "../features/mixpanel/store/actions";
import { isTestEnv } from "../utils/environment";

function* initializeMixpanelAndUpdateState() {
  const state = (yield* select()) as GlobalState;
  yield* call(initializeMixPanel, state);
  yield* put(setIsMixpanelInitialized(true));
}

export function* watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel() {
  yield* takeLatest(
    [getType(sessionExpired), getType(sessionInvalid)],
    resetMixpanel
  );
}

export function* identifyMixpanelSaga(): Generator<
  ReduxSagaEffect,
  void,
  boolean
> {
  yield* call(identifyMixpanel);
}

export function* resetMixpanelSaga(): Generator<
  ReduxSagaEffect,
  void,
  boolean
> {
  yield* call(resetMixpanel);
}

export function* initMixpanel(): Generator<ReduxSagaEffect, void, boolean> {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> =
    yield* select(isMixpanelEnabled);

  if (isMixpanelEnabledResult ?? true) {
    // initialize mixpanel
    yield* call(initializeMixpanelAndUpdateState);
  }
}

export function* handleSetMixpanelEnabled(
  action: ActionType<typeof setMixpanelEnabled>
) {
  if (action.payload) {
    yield* call(initializeMixpanelAndUpdateState);
    // The user has opted in
    yield* call(identifyMixpanelSaga);
  } else {
    yield* call(terminateMixpanel);
    yield* put(setIsMixpanelInitialized(false));
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
    if (isMixpanelEnabledResult === true) {
      // if user already opt-in, identify mixpanel
      yield* call(identifyMixpanelSaga);
    }
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
  // Update mixpanel profile properties
  // (mainly for mixpanel opt-in)
  const state = (yield* select()) as GlobalState;
  yield* call(updateMixpanelProfileProperties, state);
}

export const testable = isTestEnv
  ? { initializeMixpanelAndUpdateState }
  : undefined;
