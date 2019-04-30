import * as pot from "italia-ts-commons/lib/pot";
import { Effect } from "redux-saga";
import { put, select, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { navigateToTosScreen } from "../../store/actions/navigation";
import { tosAccept } from "../../store/actions/onboarding";
import { isTosAcceptedSelector } from "../../store/reducers/onboarding";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

export function* checkAcceptedTosSaga(): IterableIterator<Effect> {
  // From the state we check whether the user has already accepted the ToS
  // FIXME: ToS can change over time, this step should eventually check whether
  //        the user has accepted the latest version of the ToS and store the
  //        information in the user profile.
  const isTosAccepted: ReturnType<typeof isTosAcceptedSelector> = yield select<
    GlobalState
  >(isTosAcceptedSelector);

  if (!isTosAccepted) {
    // Navigate to the TosScreen
    yield put(navigateToTosScreen);

    // Here we wait the user accept the ToS
    yield take(getType(tosAccept.request));

    // We're done with accepting the ToS, dispatch the action that updates
    // the redux state.
    yield put(tosAccept.success());
  }
}

export function* checkAcceptedTosSagaVersion(): IterableIterator<Effect> {
  // Get the current Profile from the state
  const profileState: ReturnType<typeof profileSelector> = yield select<
    GlobalState
  >(profileSelector);

  if (pot.isNone(profileState)) {
    // somewhing's wrong, we don't even have an AuthenticatedProfile meaning
    // the used didn't yet authenticated: ignore this upsert request.
    return;
  }

  const currentProfile = profileState.value;

  // if (currentProfile.accepted_tos_version < CURRENT_TOS_VERSION) {
  if (currentProfile.accepted_tos_version < 1) {
    // Navigate to the TosScreen
    yield put(navigateToTosScreen);

    // Here we wait the user accept the ToS
    yield take(getType(tosAccept.request));

    // We're done with accepting the ToS, dispatch the action that updates
    // the redux state.
    yield put(tosAccept.success());
  }
}
