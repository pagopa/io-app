import { SagaIterator } from "redux-saga";
import { takeLatest } from "typed-redux-saga/macro";
import { itwCieIsSupported, itwNfcIsEnabled } from "../store/actions";
import { handleNfcEnabledSaga } from "./handleNfcEnabledSaga";
import { handleCieSupportedSaga } from "./handleCieSupportedSaga";

// TODO: [SIW-1404] remove this saga and move the logic to xstate
export function* watchItwIdentificationSaga(): SagaIterator {
  yield* takeLatest(itwNfcIsEnabled.request, handleNfcEnabledSaga);
  yield* takeLatest(itwCieIsSupported.request, handleCieSupportedSaga);
}
