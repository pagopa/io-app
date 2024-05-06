import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { itwNfcIsEnabled } from "../store/actions";
import { handleNfcEnabledSaga } from "./handleNfcEnabledSaga";

export function* watchItwAuthenticationSaga(): SagaIterator {
  yield* takeLatest(itwNfcIsEnabled.request, handleNfcEnabledSaga);
}
