import { SagaIterator } from "redux-saga";
import { takeEvery, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import {
  cgnActivationStart,
  cgnRequestActivation
} from "../store/actions/activation";
import { apiUrlPrefix } from "../../../../config";
import { BackendCGN } from "../api/backendCgn";
import { cgnDetails } from "../store/actions/details";
import { cngGenerateOtp } from "../store/actions/otp";
import { handleCgnStartActivationSaga } from "./orchestration/activation/activationSaga";
import { handleCgnActivationSaga } from "./orchestration/activation/handleActivationSaga";
import {
  cgnActivationSaga,
  handleCgnStatusPolling
} from "./networking/activation/getBonusActivationSaga";
import { cgnGetInformationSaga } from "./networking/details/getCgnInformationSaga";
import { cgnGenerateOtp } from "./networking/otp";

export function* watchBonusCgnSaga(bearerToken: string): SagaIterator {
  // create client to exchange data with the APIs
  const backendCGN = BackendCGN(apiUrlPrefix, bearerToken);

  // CGN Activation request with status polling
  yield takeLatest(
    getType(cgnRequestActivation.request),
    handleCgnActivationSaga,
    cgnActivationSaga(
      backendCGN.startCgnActivation,
      handleCgnStatusPolling(backendCGN.getCgnActivation)
    )
  );

  // CGN Activation workflow
  yield takeEvery(getType(cgnActivationStart), handleCgnStartActivationSaga);

  // CGN Load details
  yield takeLatest(
    getType(cgnDetails.request),
    cgnGetInformationSaga,
    backendCGN.getCgnStatus
  );

  // CGN Load details
  yield takeLatest(
    getType(cgnDetails.request),
    cgnGetInformationSaga,
    backendCGN.getCgnStatus
  );

  // CGN Otp generation
  yield takeLatest(
    getType(cngGenerateOtp.request),
    cgnGenerateOtp,
    backendCGN.generateOtp
  );
}
