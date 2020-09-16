import { readableReport } from "italia-ts-commons/lib/reporters";
import { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import {
  checkCurrentSession,
  sessionExpired,
  sessionInformationLoadSuccess
} from "../../store/actions/authentication";
import { SagaCallReturnType } from "../../types/utils";

export function* checkSession(
  getSessionValidity: ReturnType<typeof BackendClient>["getSession"]
): SagaIterator {
  try {
    const response: SagaCallReturnType<typeof getSessionValidity> = yield call(
      getSessionValidity,
      {}
    );

    if (response.isLeft()) {
      throw Error(readableReport(response.value));
    } else {
      // On response we check the current status if 401 the session is invalid
      // the result will be false and then put the session expired action
      yield put(
        checkCurrentSession.success({
          isSessionValid: response.value.status !== 401
        })
      );

      if (response.value.status === 200) {
        yield put(sessionInformationLoadSuccess(response.value.value));
      }
    }
  } catch (error) {
    yield put(checkCurrentSession.failure(error));
  }
}

export function* checkSessionResult(
  action: ReturnType<typeof checkCurrentSession["success"]>
) {
  if (!action.payload.isSessionValid) {
    yield put(sessionExpired());
  }
}

// Saga that listen to check session dispatch and returns it's validity
export function* watchCheckSessionSaga(
  getSessionValidity: ReturnType<typeof BackendClient>["getSession"]
): SagaIterator {
  yield takeLatest(
    getType(checkCurrentSession.request),
    checkSession,
    getSessionValidity
  );
  yield takeLatest(getType(checkCurrentSession.success), checkSessionResult);
}
