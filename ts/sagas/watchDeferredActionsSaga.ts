import { Effect, put, select, takeEvery } from "redux-saga/effects";
import { DEFER_TO_LOGIN } from "../store/actions/constants";
import { DeferToLogin, pushToDeferredActions } from "../store/actions/deferred";
import { isPinLoginValidSelector } from "../store/reducers/pinlogin";

function* handleDeferredActionSaga({
  payload: action
}: DeferToLogin): IterableIterator<Effect> {
  const isPinValid: boolean = yield select(isPinLoginValidSelector);

  if (isPinValid) {
    yield put(action);
  } else {
    yield put(pushToDeferredActions(action));
  }
}

export function* watchDeferredActionsSaga(): IterableIterator<Effect> {
  yield takeEvery(DEFER_TO_LOGIN, handleDeferredActionSaga);
}
