import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import {
  checkCurrentSession,
  checkCurrentSessionFailure,
  checkCurrentSessionSuccess,
  sessionExpired
} from "../../store/actions/authentication";
import { SagaCallReturnType } from "../../types/utils";

export function* checkSession(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Iterator<Effect> {
  try {
    const response: SagaCallReturnType<typeof getProfile> = yield call(
      getProfile,
      {}
    );
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    } else {
      // On response we check the current status if 401 the session is invalid
      // the result will be false and then put the session expired action
      yield put(
        checkCurrentSessionSuccess({
          sessionValid: response.value.status !== 401
        })
      );
    }
  } catch (error) {
    yield put(checkCurrentSessionFailure(error));
  }
}

// Saga that listen to check session dispatch and returns it's validity
export function* watchCheckSessionSaga(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Iterator<Effect> {
  yield takeLatest(getType(checkCurrentSession), checkSession, getProfile);
  yield takeLatest(getType(checkCurrentSessionSuccess), function*(
    action: ReturnType<typeof checkCurrentSessionSuccess>
  ) {
    if (!action.payload.sessionValid) {
      yield put(sessionExpired());
    }
  });
}
