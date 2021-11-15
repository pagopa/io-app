import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, take } from "redux-saga/effects";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { BackendCGN } from "../../../api/backendCgn";
import {
  navigateToCgnDetails,
  navigateToEycaActivationLoading
} from "../../../navigation/actions";
import {
  cgnEycaActivation,
  cgnEycaActivationCancel
} from "../../../store/actions/eyca/activation";
import { cgnEycaStatus } from "../../../store/actions/eyca/details";
import {
  getActivation,
  handleEycaActivationSaga,
  handleStartActivation
} from "../../networking/eyca/activation/getEycaActivationSaga";

/**
 * This saga handles the activation request for an EYCA Card linked to the user's CGN.
 * This activation flow may be invoked only if the background activation process originated from the Backend
 * terminated with errors and no EYCA information is available.
 * First we check the current status of the activation orchestrator and then we follow this logic:
 * - COMPLETED/ERROR/NOT_FOUND: request for a new activation, then start polling until we have results
 * - PROCESSING/RUNNING: we start polling waiting for results
 *
 * At the end navigate back to CGN detail and request again for EYCA Details
 * @param getEycaActivation
 * @param startEycaActivation
 */
export function* eycaActivationWorker(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"],
  startEycaActivation: ReturnType<typeof BackendCGN>["startEycaActivation"]
) {
  yield call(navigateToEycaActivationLoading);

  const eycaActivation: SagaCallReturnType<typeof getActivation> = yield call(
    getActivation,
    getEycaActivation
  );

  if (eycaActivation.isRight()) {
    if (eycaActivation.value === "PROCESSING") {
      yield call(handleEycaActivationSaga, getEycaActivation);
    } else {
      const startActivation: SagaCallReturnType<typeof handleStartActivation> =
        yield call(handleStartActivation, startEycaActivation);
      // activation not handled error, stop
      if (startActivation.isLeft()) {
        yield put(cgnEycaActivation.failure(startActivation.value));
        return;
      } else {
        // could be: ALREADY_ACTIVE, INELIGIBLE
        if (
          ["ALREADY_ACTIVE", "INELIGIBLE"].some(
            v => v === startActivation.value
          )
        ) {
          yield put(cgnEycaActivation.success(startActivation.value));
          yield call(navigateToCgnDetails);
          return;
        } else {
          yield call(handleEycaActivationSaga, getEycaActivation);
        }
      }
    }
  }

  // Activation saga ended, request again the details
  yield put(cgnEycaStatus.request());

  yield call(navigateToCgnDetails);
}

/**
 * This saga handles the CGN activation polling
 */
export function* eycaActivationSaga(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"],
  startEycaActivation: ReturnType<typeof BackendCGN>["startEycaActivation"]
): SagaIterator {
  const { cancelAction } = yield race({
    activation: call(
      eycaActivationWorker,
      getEycaActivation,
      startEycaActivation
    ),
    cancelAction: take(cgnEycaActivationCancel)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
