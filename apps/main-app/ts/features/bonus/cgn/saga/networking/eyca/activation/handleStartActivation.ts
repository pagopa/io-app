import * as E from "fp-ts/lib/Either";
import { call } from "typed-redux-saga/macro";

import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../../types/utils";
import {
  getNetworkError,
  NetworkError
} from "../../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";
import { withRefreshApiCall } from "../../../../../../authentication/fastLogin/saga/utils";
import { BackendCGN } from "../../../../api/backendCgn";
import { cgnEycaActivation } from "../../../../store/actions/eyca/activation";

type StartEycaStatus = "ALREADY_ACTIVE" | "INELIGIBLE" | "PROCESSING";

const mapStatus = new Map<number, StartEycaStatus>([
  [201, "PROCESSING"],
  [202, "PROCESSING"],
  [403, "INELIGIBLE"],
  [409, "ALREADY_ACTIVE"]
]);

/**
 * Ask for starting activation of EYCA card
 *
 * @param startEycaActivation
 */
export function* handleStartActivation(
  startEycaActivation: ReturnType<typeof BackendCGN>["startEycaActivation"]
): Generator<ReduxSagaEffect, E.Either<NetworkError, StartEycaStatus>, any> {
  try {
    const startEycaActivationRequest = startEycaActivation({});
    const startEycaActivationResult = (yield* call(
      withRefreshApiCall,
      startEycaActivationRequest,
      cgnEycaActivation.request()
    )) as unknown as SagaCallReturnType<typeof startEycaActivation>;
    if (E.isRight(startEycaActivationResult)) {
      const status = startEycaActivationResult.right.status;
      const activationStatus = mapStatus.get(status);
      if (activationStatus) {
        return E.right(activationStatus);
      }
      throw Error(`response status ${startEycaActivationResult.right.status}`);
    }
    // decoding failure
    throw Error(readablePrivacyReport(startEycaActivationResult.left));
  } catch (e) {
    return E.left(getNetworkError(e));
  }
}
