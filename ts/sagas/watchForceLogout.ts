import { delay } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { sessionExpired } from "../store/actions/authentication";
import {
  identificationCancel,
  identificationForceLogout
} from "../store/actions/identification";

export function* watchForceLogout() {
  while (true) {
    yield take(identificationForceLogout);

    yield put.resolve(identificationCancel());
    yield delay(500);
    yield put.resolve(sessionExpired());
  }
}
