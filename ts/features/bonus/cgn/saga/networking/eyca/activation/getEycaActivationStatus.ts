import { call, put } from "redux-saga/effects";
import { BackendCGN } from "../../../../api/backendCgn";
import { SagaCallReturnType } from "../../../../../../../types/utils";
import { cgnEycaActivation } from "../../../../store/actions/eyca/activation";
import { getActivation } from "./getEycaActivationSaga";

// export type GetEycaStatus = "COMPLETED" | "PROCESSING" | "ERROR" | "NOT_FOUND";
export function* getEycaActivationStatusSaga(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
) {
  const activationInfo: SagaCallReturnType<typeof getActivation> = yield call(
    getActivation,
    getEycaActivation
  );
  if (activationInfo.isLeft()) {
    yield put(cgnEycaActivation.failure(activationInfo.value));
  } else {
    yield put(cgnEycaActivation.success(activationInfo.value));
  }
}
