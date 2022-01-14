import { delay, put } from "redux-saga/effects";
import { cgnUnsubscribe } from "../../../store/actions/unsubscribe";

// handle the request for CGN bucket consumption
export function* cgnUnsubscriptionHandler(_: unknown) {
  yield delay(400);
  yield put(cgnUnsubscribe.success());
}
