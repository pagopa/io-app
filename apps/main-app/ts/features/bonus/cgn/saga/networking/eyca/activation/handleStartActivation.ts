import { err, ok, Result } from "neverthrow";
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

export type StartActivationResult = Result<StartEycaStatus, NetworkError>;

type StartEycaStatus = "ALREADY_ACTIVE" | "INELIGIBLE" | "PROCESSING";

const mapStatus = new Map<number, StartEycaStatus>([
  [201, "PROCESSING"],
  [202, "PROCESSING"],
  [403, "INELIGIBLE"],
  [409, "ALREADY_ACTIVE"]
]);

/**
 * ask for starting activation of EYCA card
 * @param startEycaActivation
 */
export function* handleStartActivation(
  startEycaActivation: ReturnType<typeof BackendCGN>["startEycaActivation"]
): Generator<ReduxSagaEffect, StartActivationResult, any> {
  try {
    const startEycaActivationRequest = startEycaActivation({});
    const startEycaActivationResult = (yield* call(
      withRefreshApiCall,
      startEycaActivationRequest,
      cgnEycaActivation.request()
    )) as unknown as SagaCallReturnType<typeof startEycaActivation>;
    if ("right" in startEycaActivationResult) {
      const status = startEycaActivationResult.right.status;
      const activationStatus = mapStatus.get(status);
      if (activationStatus) {
        return ok(activationStatus);
      }
      throw Error(`response status ${startEycaActivationResult.right.status}`);
    }
    // decoding failure
    throw Error(readablePrivacyReport(startEycaActivationResult.left));
  } catch (e) {
    return err(getNetworkError(e));
  }
}
