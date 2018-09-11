import { put, select } from "redux-saga/effects";

import { NavigationActions } from "react-navigation";
import { clearDeferredNavigationAction } from "../../store/actions/deferredNavigation";
import {
  deferredNavigationActionSelector,
  DeferredNavigationActionState
} from "../../store/reducers/deferredNavigation";

export function* navigateOnAppRestoreSaga() {
  const deferredNavigationState: DeferredNavigationActionState = yield select(
    deferredNavigationActionSelector
  );

  if (deferredNavigationState.navigation) {
    // If a deferred navigation action has been stored, navigate to it.
    yield put(deferredNavigationState.navigation);
    yield put(clearDeferredNavigationAction());
  } else {
    // Or else, just navigate back to the screen we were at before
    // going into background
    yield put(NavigationActions.back());
  }
}
