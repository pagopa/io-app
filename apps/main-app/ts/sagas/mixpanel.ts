import { CommonActions, StackActions } from "@react-navigation/native";
import { call, put, select, take, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";

import {
  sessionExpired,
  sessionInvalid
} from "../features/authentication/common/store/actions";
import { setIsMixpanelInitialized } from "../features/mixpanel/store/actions";
import {
  identifyMixpanel,
  initializeMixPanel,
  resetMixpanel,
  terminateMixpanel
} from "../mixpanel";
import { updateMixpanelProfileProperties } from "../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../mixpanelConfig/superProperties";
import NavigationService from "../navigation/NavigationService";
import ROUTES from "../navigation/routes";
import { setMixpanelEnabled } from "../store/actions/mixpanel";
import { isMixpanelEnabled } from "../store/reducers/persistedPreferences";
import { GlobalState } from "../store/reducers/types";
import { ReduxSagaEffect } from "../types/utils";
import { isTestEnv } from "../utils/environment";

/**
 * Checks whether the user has already expressed a Mixpanel opt-in preference
 * and, if not, asks for it. This saga is also responsible for updating the
 * Mixpanel profile and super properties
 */
export function* askMixpanelOptIn() {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> =
    yield* select(isMixpanelEnabled);
  // user already express a preference
  // do nothing
  if (isMixpanelEnabledResult !== null) {
    if (isMixpanelEnabledResult === true) {
      // if user already opt-in, identify mixpanel and refresh properties
      yield* call(identifyMixpanelSaga);
      yield* call(updateMixpanelProfileAndSuperProperties);
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
  // Update mixpanel profile and super properties
  // (mainly for mixpanel opt-in)
  yield* call(updateMixpanelProfileAndSuperProperties);
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

export function* identifyMixpanelSaga(): Generator<
  ReduxSagaEffect,
  void,
  boolean
> {
  yield* call(identifyMixpanel);
}

export function* initMixpanel(): Generator<ReduxSagaEffect, void, boolean> {
  const isMixpanelEnabledResult: ReturnType<typeof isMixpanelEnabled> =
    yield* select(isMixpanelEnabled);

  if (isMixpanelEnabledResult ?? true) {
    // initialize mixpanel
    yield* call(initializeMixpanelAndUpdateState);
  }
}

export function* resetMixpanelSaga(): Generator<
  ReduxSagaEffect,
  void,
  boolean
> {
  yield* call(resetMixpanel);
}

/**
 * Recomputes and pushes all Mixpanel profile and super properties from the
 * current state.
 */
export function* updateMixpanelProfileAndSuperProperties() {
  const state: GlobalState = yield* select();
  yield* call(updateMixpanelProfileProperties, state);
  yield* call(updateMixpanelSuperProperties, state);
}

export function* watchForActionsDifferentFromRequestLogoutThatMustResetMixpanel() {
  yield* takeLatest(
    [getType(sessionExpired), getType(sessionInvalid)],
    resetMixpanel
  );
}

function* initializeMixpanelAndUpdateState() {
  const state = (yield* select()) as GlobalState;
  yield* call(initializeMixPanel, state);
  yield* put(setIsMixpanelInitialized(true));
}

export const testable = isTestEnv
  ? { initializeMixpanelAndUpdateState }
  : undefined;
