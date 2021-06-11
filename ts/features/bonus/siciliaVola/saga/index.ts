import { takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { SagaIterator } from "redux-saga";
import { svGenerateVoucherStart } from "../store/actions/voucherGeneration";
import { handleSvVoucherGenerationStartActivationSaga } from "./orchestration/voucherGeneration";

export function* watchBonusSvSaga(): SagaIterator {
  // SV Activation workflow
  yield takeLatest(
    getType(svGenerateVoucherStart),
    handleSvVoucherGenerationStartActivationSaga
  );
}
