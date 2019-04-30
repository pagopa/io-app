import { Effect } from "redux-saga";
import { put, select, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { navigateToTosScreen } from "../../store/actions/navigation";
import { tosAccept } from "../../store/actions/onboarding";
import { profileUpsert } from "../../store/actions/profile";
import {
  isTosAcceptedSelector,
  tosAcceptedVersion
} from "../../store/reducers/onboarding";

import { GlobalState } from "../../store/reducers/types";
import { TOS_VERSION } from "../../utils/constants";

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
  const userTosAcceptedVersion: ReturnType<
    typeof tosAcceptedVersion
  > = yield select<GlobalState>(tosAcceptedVersion);

  if (userTosAcceptedVersion < TOS_VERSION) {
    // Navigate to the TosScreen
    yield put(navigateToTosScreen);

    // Here we wait the user accept the ToS
    yield take(getType(tosAccept.request));

    // We're done with accepting the ToS, dispatch the action that updates
    // the redux state.
    yield put(tosAccept.success());

    console.log("dispatch the ToS to backend");
    // TODO: dispatch the ToS to backend
    yield put(
      profileUpsert.request({
        accepted_tos_version: TOS_VERSION
      })
    );
  }
}
