import { Effect } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";

import {
  logoutFailure,
  logoutRequest,
  logoutSuccess,
  sessionExpired
} from "../../store/actions/authentication";

import { readableReport } from "italia-ts-commons/lib/reporters";
import { SagaCallReturnType } from "../../types/utils";

/**
 * Handles the logout flow
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchLogoutSaga(
  logout: ReturnType<typeof BackendClient>["logout"]
): Iterator<Effect> {
  yield takeEvery(getType(logoutRequest), function*(
    action: ActionType<typeof logoutRequest>
  ) {
    // Issue a logout request to the backend, asking to delete the session
    // FIXME: if there's no connectivity to the backend, this request will
    //        block for a while.
    const response: SagaCallReturnType<typeof logout> = yield call(logout, {});
    if (response.isRight() && response.value.status === 200) {
      yield put(logoutSuccess(action.payload));
    } else {
      // We got a error, send a LOGOUT_FAILURE action so we can log it using Mixpanel
      const error: Error = response.isRight()
        ? Error(
            response.value.status === 500 && response.value.value.title
              ? response.value.value.title
              : "Unknown error"
          )
        : Error(readableReport(response.value));
      yield put(logoutFailure(error));
    }
    // Force the login by expiring the session
    // FIXME: possibly reset the navigation stack as the watcher of
    // SESSION_EXPIRED will save the navigation state and later restore it
    yield put(sessionExpired());
  });
}
