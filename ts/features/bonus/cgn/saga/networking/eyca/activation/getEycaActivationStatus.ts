import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../../types/utils";
import { BackendCGN } from "../../../../api/backendCgn";
import { cgnEycaActivation } from "../../../../store/actions/eyca/activation";
import { getActivation } from "./getEycaActivationSaga";

export function* getEycaActivationStatusSaga(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
) {
  const activationInfo: SagaCallReturnType<typeof getActivation> = yield* call(
    getActivation,
    getEycaActivation
  );
  if (E.isLeft(activationInfo)) {
    yield* put(cgnEycaActivation.failure(activationInfo.left));
  } else {
    yield* put(cgnEycaActivation.success(activationInfo.right));
  }
}
