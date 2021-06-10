import { takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { svGenerateVoucherStart } from "../store/actions/voucherGeneration";
import { handleSvVoucherGenerationStartActivationSaga } from "./orchestration/voucherGeneration";
import { SagaIterator } from "redux-saga";

export function* watchBonusSvSaga(): SagaIterator {
  // SV Activation workflow
  yield takeLatest(
    getType(svGenerateVoucherStart),
    handleSvVoucherGenerationStartActivationSaga
  );
}
