import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { itwCieIsSupported, itwNfcIsEnabled } from "../store/actions";
import { handleNfcEnabledSaga } from "./handleNfcEnabledSaga";
import { handleCieSupportedSaga } from "./handleCieSupportedSaga";

export function* watchItwIdentificationSaga(): SagaIterator {
  yield* takeLatest(itwNfcIsEnabled.request, handleNfcEnabledSaga);
  yield* takeLatest(itwCieIsSupported.request, handleCieSupportedSaga);
}
