import { call, put, race, take } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { NavigationActions } from "react-navigation";
import {
  navigateToCgnDetails,
  navigateToEycaActivationLoading
} from "../../../navigation/actions";
import { handleEycaActivationSaga } from "../../networking/eyca/activation/getEycaActivationSaga";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { cgnEycaActivationCancel } from "../../../store/actions/eyca/activation";
import { BackendCGN } from "../../../api/backendCgn";
import { cgnEycaStatus } from "../../../store/actions/eyca/details";

export function* eycaActivationWorker(
  getEycaActivation: ReturnType<typeof BackendCGN>["getEycaActivation"],
  startEycaActivation: ReturnType<typeof BackendCGN>["startEycaActivation"]
) {
  yield put(navigateToEycaActivationLoading());
  yield put(navigationHistoryPop(1));

  yield call(handleEycaActivationSaga, getEycaActivation, startEycaActivation);

  // Activation saga ended, request again the details
  yield put(cgnEycaStatus.request());

  yield put(navigateToCgnDetails());
  yield put(navigationHistoryPop(1));
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
