import { call, put } from "typed-redux-saga/macro";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import {
  ReduxSagaEffect,
  SagaCallReturnType
} from "../../../../../../../types/utils";
import { BackendCGN } from "../../../../api/backendCgn";
import { startTimer } from "../../../../../../../utils/timer";
import { readablePrivacyReport } from "../../../../../../../utils/reporters";
import {
  getGenericError,
  getNetworkError,
  NetworkError
} from "../../../../../../../utils/errors";
import { StatusEnum } from "../../../../../../../../definitions/cgn/EycaActivationDetail";
import { cgnEycaActivation } from "../../../../store/actions/eyca/activation";
import { withRefreshApiCall } from "../../../../../../authentication/fastLogin/saga/utils";

// wait time between requests
const cgnResultPolling = 1000 as Millisecond;
// polling will be stopped when elapsed time from start exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

type StartEycaStatus = "INELIGIBLE" | "ALREADY_ACTIVE" | "PROCESSING";
const mapStatus: Map<number, StartEycaStatus> = new Map([
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

type GetEycaStatus = "COMPLETED" | "PROCESSING" | "ERROR" | "NOT_FOUND";
/**
 * ask for the current status of EYCA activation
 * it returns the status {@link GetEycaStatus} - right case
 * if an error occured it returns a {@link NetworkError} - left case
 * @param getEycaActivation
 */
export function* getActivation(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
): Generator<ReduxSagaEffect, E.Either<NetworkError, GetEycaStatus>, any> {
  try {
    const getEycaActivationRequest = getEycaActivation({});
    const getEycaActivationResult = (yield* call(
      withRefreshApiCall,
      getEycaActivationRequest,
      cgnEycaActivation.request()
    )) as unknown as SagaCallReturnType<typeof getEycaActivation>;
    if (E.isRight(getEycaActivationResult)) {
      if (getEycaActivationResult.right.status === 200) {
        const result = getEycaActivationResult.right.value;
        switch (result.status) {
          case StatusEnum.COMPLETED:
            return E.right("COMPLETED");
          case StatusEnum.ERROR:
            return E.right("ERROR");
          case StatusEnum.PENDING:
          case StatusEnum.RUNNING:
            return E.right("PROCESSING");
          default: {
            const reason = `unexpected status result ${getEycaActivationResult.right.value.status}`;
            return E.left(getGenericError(new Error(reason)));
          }
        }
      } else if (getEycaActivationResult.right.status === 404) {
        return E.right("NOT_FOUND");
      } else {
        return E.left(
          getGenericError(
            new Error(`response status ${getEycaActivationResult.right.status}`)
          )
        );
      }
    } else {
      // decoding failure
      return E.left(
        getGenericError(
          new Error(readablePrivacyReport(getEycaActivationResult.left))
        )
      );
    }
  } catch (e) {
    return E.left(getNetworkError(e));
  }
}

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
      case "NOT_FOUND":
        yield* put(cgnEycaActivation.success("NOT_FOUND"));
        // ask for activation
        return;
      case "ERROR":
        // activation logic error
        yield* put(cgnEycaActivation.success("ERROR"));
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
