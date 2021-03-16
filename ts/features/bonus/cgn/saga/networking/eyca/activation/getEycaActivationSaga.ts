import { call, Effect, put } from "redux-saga/effects";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Either, left, right } from "fp-ts/lib/Either";
import { SagaCallReturnType } from "../../../../../../../types/utils";
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

// wait time between requests
const cgnResultPolling = 1000 as Millisecond;
// stop polling when elapsed time from the beginning exceeds this threshold
const pollingTimeThreshold = (10 * 1000) as Millisecond;

type StartEycaStatus = "INELIGIBLE" | "ALREADY_ACTIVE" | "PROCESSING";
type GetEycaStatus = "COMPLETED" | "PROCESSING" | "ERROR" | "NOT_FOUND";
const mapStatus: Map<number, StartEycaStatus> = new Map([
  [201, "PROCESSING"],
  [202, "PROCESSING"],
  [403, "INELIGIBLE"],
  [409, "ALREADY_ACTIVE"]
]);

/**
 * Function that handles the activation of a EYCA Card
 * Calls the activation API returning the next iteration for orchestration saga:
 * 201 -> Request created start polling with handleEycaStatusPolling saga.
 * 202 -> There's already a processing request -> EycaDetails is in PENDING STATE
 * 401 -> Bearer token null or expired -> EycaDetails is in INELIGIBLE STATE
 * 409 -> Cannot activate the user's cgn because another updateCgn request was found for this user or it is already active
 * 403 -> Cannot activate a new EYCA because the user is ineligible to get the CGN -> EycaDetails is in INELIGIBLE STATE
 * @param startEycaActivation backend client for CGN Activation API
 * @param handleEycaStatusPolling saga that handles the polling result of a EYCA Activation
 */
function* handleStartActivation(
  startEycaActivation: ReturnType<typeof BackendCGN>["startEycaActivation"]
): Generator<Effect, Either<NetworkError, StartEycaStatus>, any> {
  try {
    const startEycaActivationResult: SagaCallReturnType<typeof startEycaActivation> = yield call(
      startEycaActivation,
      {}
    );
    if (startEycaActivationResult.isRight()) {
      const status = startEycaActivationResult.value.status;
      const activationStatus = mapStatus.get(status);
      if (activationStatus) {
        return right(activationStatus);
      }
      throw Error(`response status ${startEycaActivationResult.value.status}`);
    }
    // decoding failure
    throw Error(readablePrivacyReport(startEycaActivationResult.value));
  } catch (e) {
    return left(getNetworkError(e));
  }
}

function* getActivation(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"]
): Generator<Effect, Either<NetworkError, GetEycaStatus>, any> {
  try {
    const getEycaActivationResult: SagaCallReturnType<typeof getEycaActivation> = yield call(
      getEycaActivation,
      {}
    );
    if (getEycaActivationResult.isRight()) {
      if (getEycaActivationResult.value.status === 200) {
        const result = getEycaActivationResult.value.value;
        switch (result.status) {
          case StatusEnum.COMPLETED:
            return right("COMPLETED");
          case StatusEnum.ERROR:
            return right("ERROR");
          case StatusEnum.PENDING:
          case StatusEnum.RUNNING:
            return right("PROCESSING");
          default:
            const reason = `unexpected status result ${getEycaActivationResult.value.value.status}`;
            return left(getGenericError(new Error(reason)));
        }
      } else if (getEycaActivationResult.value.status === 404) {
        return right("NOT_FOUND");
      } else {
        return left(
          getGenericError(
            new Error(`response status ${getEycaActivationResult.value.status}`)
          )
        );
      }
    } else {
      // decoding failure
      return left(
        getGenericError(
          new Error(readablePrivacyReport(getEycaActivationResult.value))
        )
      );
    }
  } catch (e) {
    return left(getNetworkError(e));
  }
}

/**
 * Function that handles the polling check of the EYCA's status
 * Calls the status API with a polling interrupted only if it's activated or if a network error has been raised
 * @param getEycaActivation backend client to know the current user CGN status
 * @param startEycaActivation backend client to know the current user CGN status
 */
export function* handleEycaActivationSaga(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"],
  startEycaActivation: ReturnType<typeof BackendCGN>["startEycaActivation"]
) {
  const startPollingTime = new Date().getTime();
  while (true) {
    const activationInfo: SagaCallReturnType<typeof getActivation> = yield call(
      getActivation,
      getEycaActivation
    );
    if (activationInfo.isLeft()) {
      yield put(cgnEycaActivation.failure(activationInfo.value));
      return;
    }
    const status: GetEycaStatus = activationInfo.value;
    switch (status) {
      case "COMPLETED":
        yield put(cgnEycaActivation.success("COMPLETED"));
        return;
      case "NOT_FOUND":
        // ask for activation
        const startActivation = yield call(
          handleStartActivation,
          startEycaActivation
        );
        // activation not handled error, stop
        if (startActivation.isLeft()) {
          yield put(cgnEycaActivation.failure(startActivation.value));
          return;
        } else {
          const startActivationStatus: StartEycaStatus = startActivation.value;
          // could be: ALREADY_ACTIVE, INELIGIBLE
          if (startActivationStatus !== "PROCESSING") {
            yield put(cgnEycaActivation.success(startActivation.value));
            return;
          }
        }
        break;
      case "ERROR":
        // activation logic error
        yield put(cgnEycaActivation.success("ERROR"));
        return;
    }
    yield put(cgnEycaActivation.success("POLLING"));
    // sleep
    yield call(startTimer, cgnResultPolling);
    const now = new Date().getTime();
    // stop polling if threshold is exceeded
    if (now - startPollingTime >= pollingTimeThreshold) {
      yield put(cgnEycaActivation.success("POLLING_TIMEOUT"));
      return;
    }
  }
}
