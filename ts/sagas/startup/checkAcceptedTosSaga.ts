import { Effect } from "redux-saga";
import { put, select, take } from "redux-saga/effects";

import { TOS_ACCEPT_REQUEST } from "../../store/actions/constants";
import { navigateToTosScreen } from "../../store/actions/navigation";
import { tosAcceptSuccess } from "../../store/actions/onboarding";
import { isTosAcceptedSelector } from "../../store/reducers/onboarding";

export function* checkAcceptedTosSaga(): IterableIterator<Effect> {
  // From the state we check whether the user has already accepted the ToS
  // FIXME: ToS can change over time, this step should eventually check whether
  //        the user has accepted the latest version of the ToS and store the
  //        information in the user profile.
  const isTosAccepted: ReturnType<typeof isTosAcceptedSelector> = yield select(
    isTosAcceptedSelector
  );

  if (!isTosAccepted) {
    // Navigate to the TosScreen
    yield put(navigateToTosScreen);

    // Here we wait the user accept the ToS
    yield take(TOS_ACCEPT_REQUEST);

    // We're done with accepting the ToS, dispatch the action that updates
    // the redux state.
    yield put(tosAcceptSuccess);
  }
}
