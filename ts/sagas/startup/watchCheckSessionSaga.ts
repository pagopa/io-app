import { readableReport } from "italia-ts-commons/lib/reporters";
import { call, Effect, put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import {
  checkCurrentSession,
  checkCurrentSessionResult,
  sessionExpired
} from "../../store/actions/authentication";
import { profileLoadFailure } from "../../store/actions/profile";
import { SagaCallReturnType } from "../../types/utils";

export function* verifySession(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Iterator<Effect> {
  try {
    const response: SagaCallReturnType<typeof getProfile> = yield call(
      getProfile,
      {}
    );
    // we got an error, throw it
    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    } else {
      yield put(
        checkCurrentSessionResult({
          sessionValid: response.value.status !== 401
        })
      );
    }
  } catch (error) {
    yield put(profileLoadFailure(error));
  }
}

export function* watchCheckSessionSaga(
  getProfile: ReturnType<typeof BackendClient>["getProfile"]
): Iterator<Effect> {
  yield takeLatest(getType(checkCurrentSession), verifySession, getProfile);
  yield takeLatest(getType(checkCurrentSessionResult), function*(
    action: ReturnType<typeof checkCurrentSessionResult>
  ) {
    if (!action.payload.sessionValid) {
      yield put(sessionExpired());
    }
  });
}
