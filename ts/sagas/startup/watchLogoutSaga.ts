import I18n from "i18n-js";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import {
  logoutFailure,
  logoutRequest,
  logoutSuccess,
  sessionExpired
} from "../../store/actions/authentication";

import { LogoutT } from "../../api/backend";
import { SagaCallReturnType } from "../../types/utils";

/**
 * Handles the logout flow
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchLogoutSaga(
  logout: TypeofApiCall<LogoutT>
): Iterator<Effect> {
  yield takeEvery(getType(logoutRequest), function*(
    action: ActionType<typeof logoutRequest>
  ) {
    // Issue a logout request to the backend, asking to delete the session
    // FIXME: if there's no connectivity to the backend, this request will
    //        block for a while.
    const response: SagaCallReturnType<typeof logout> = yield call(logout, {});
    if (response && response.status === 200) {
      yield put(logoutSuccess(action.payload));
    } else {
      // We got a error, send a LOGOUT_FAILURE action so we can log it using Mixpanel
      const error: Error =
        response && response.status === 500
          ? Error(response.value.title || "Unknown error")
          : Error(I18n.t("authentication.errors.logout"));
      yield put(logoutFailure(error));
    }
    // Force the login by expiring the session
    // FIXME: possibly reset the navigation stack as the watcher of
    // SESSION_EXPIRED will save the navigation state and later restore it
    yield put(sessionExpired());
  });
}
