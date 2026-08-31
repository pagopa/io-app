import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";

import { SagaCallReturnType } from "../../../../../../../types/utils";
import { startTimer } from "../../../../../../../utils/timer";
import { BackendCGN } from "../../../../api/backendCgn";
import { cgnEycaActivation } from "../../../../store/actions/eyca/activation";
import { getActivation } from "./getActivation";

// wait time between requests
const cgnResultPolling = 1000 as Millisecond;
// polling will be stopped when elapsed time from start exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

/**
 * Function that handles the activation of EYCA card
 * see https://www.pivotaltracker.com/story/show/177062719/comments/222747527
 * first it checks for the status activation
 * depending on that, it could start a polling to wait about completion or ends with a defined state
 * @param getEycaActivation asks for the status of EYCA card activation
 */
export function* handleEycaActivationSaga(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
) {
  const startPollingTime = new Date().getTime();
  while (true) {
    const activationInfo: SagaCallReturnType<typeof getActivation> =
      yield* call(getActivation, getEycaActivation);
    if (E.isLeft(activationInfo)) {
      yield* put(cgnEycaActivation.failure(activationInfo.left));
      return;
    }
    switch (activationInfo.right) {
      case "COMPLETED":
        yield* put(cgnEycaActivation.success("COMPLETED"));
        return;
      case "ERROR":
        // activation logic error
        yield* put(cgnEycaActivation.success("ERROR"));
        return;
      case "NOT_FOUND":
        yield* put(cgnEycaActivation.success("NOT_FOUND"));
        // ask for activation
        return;
    }
    yield* put(cgnEycaActivation.success("POLLING"));
    // sleep
    yield* call(startTimer, cgnResultPolling);
    const now = new Date().getTime();
    // stop polling if threshold is exceeded
    if (now - startPollingTime >= pollingTimeThreshold) {
      yield* put(cgnEycaActivation.success("POLLING_TIMEOUT"));
      return;
    }
  }
}
