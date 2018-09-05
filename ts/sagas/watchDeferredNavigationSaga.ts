import { all, Effect, put, select, takeEvery } from "redux-saga/effects";
import {
  NAVIGATE_IF_LOGGED_IN
} from "../store/actions/constants";
import {
  NavigateIfLoggedIn,
  saveNavigationWhenLoggedIn
} from "../store/actions/deferred-navigation";
import { ApplicationState } from "../store/actions/types";
import { applicationStateSelector } from "../store/reducers/appState";
import { isPinLoginValidSelector } from "../store/reducers/pinlogin";

function* handleDeferredNavigationSaga({
  payload: action
}: NavigateIfLoggedIn): IterableIterator<Effect> {
  const [isPinValid, appState]: [boolean, ApplicationState] = yield all([
    select(isPinLoginValidSelector),
    select(applicationStateSelector)
  ]);

  if (isPinValid && appState === "active") {
    yield put(action);
  } else {
    yield put(saveNavigationWhenLoggedIn(action));
  }
}

export function* watchDeferredActionsSaga(): IterableIterator<Effect> {
  yield takeEvery(NAVIGATE_IF_LOGGED_IN, handleDeferredNavigationSaga);
}
