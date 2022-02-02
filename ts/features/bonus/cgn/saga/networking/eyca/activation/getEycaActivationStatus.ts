import { call, put } from "typed-redux-saga";
import { BackendCGN } from "../../../../api/backendCgn";
import { SagaCallReturnType } from "../../../../../../../types/utils";
import { cgnEycaActivation } from "../../../../store/actions/eyca/activation";
import { getActivation } from "./getEycaActivationSaga";

export function* getEycaActivationStatusSaga(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
) {
  const activationInfo: SagaCallReturnType<typeof getActivation> = yield* call(
    getActivation,
    getEycaActivation
  );
  if (activationInfo.isLeft()) {
    yield* put(cgnEycaActivation.failure(activationInfo.value));
  } else {
    yield* put(cgnEycaActivation.success(activationInfo.value));
  }
}
