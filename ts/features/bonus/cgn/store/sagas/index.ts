import { SagaIterator } from "redux-saga";
import { takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { cgnActivationStart } from "../actions/activation";
import { apiUrlPrefix } from "../../../../../config";
import { BackendCGN } from "../../api/backendCgn";
import { handleCgnStartActivationSaga } from "./activation/activationSaga";
import {
  cgnActivationSaga,
  handleCgnStatusPolling
} from "./activation/getBonusActivationSaga";

export function* watchBonusCgnSaga(bearerToken: string): SagaIterator {
  // create client to exchange data with the APIs
  const backendCGN = BackendCGN(apiUrlPrefix, bearerToken);

  // First step of the activation of a CGN
  yield takeLatest(
    getType(cgnActivationStart),
    handleCgnStartActivationSaga,
    cgnActivationSaga(
      backendCGN.startCgnActivation,
      handleCgnStatusPolling(backendCGN.getCgnStatus)
    )
  );
}
