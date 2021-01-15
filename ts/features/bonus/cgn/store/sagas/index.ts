import { SagaIterator } from "redux-saga";
import { takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { cgnActivationStart } from "../actions/activation";
import { handleCgnStartActivationSaga } from "./activation/activationSaga";

export function* watchBonusCgnSaga(): SagaIterator {
  // First step of the activation of a CGN
  yield takeLatest(getType(cgnActivationStart), handleCgnStartActivationSaga);
}
