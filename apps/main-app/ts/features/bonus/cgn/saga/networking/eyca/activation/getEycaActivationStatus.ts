import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../../types/utils";
import { getNetworkError } from "../../../../../../../utils/errors";
import { BackendCGN } from "../../../../api/backendCgn";
import { cgnEycaActivation } from "../../../../store/actions/eyca/activation";
import { getActivation } from "./getEycaActivationSaga";

export function* getEycaActivationStatusSaga(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
) {
  try {
    const activationInfo: SagaCallReturnType<typeof getActivation> =
      yield* call(getActivation, getEycaActivation);
    yield* put(cgnEycaActivation.success(activationInfo));
  } catch (e) {
    yield* put(cgnEycaActivation.failure(getNetworkError(e)));
  }
}
