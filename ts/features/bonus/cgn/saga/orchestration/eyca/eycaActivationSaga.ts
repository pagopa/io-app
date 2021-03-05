import { call, put, race, take } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { NavigationActions } from "react-navigation";
import {
  navigateToCgnDetails,
  navigateToEycaActivationLoading
} from "../../../navigation/actions";
import { RequestEycaActivationSaga } from "../../networking/eyca/activation/getEycaActivationSaga";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { cgnEycaActivationCancel } from "../../../store/actions/eyca/activation";

export function* eycaActivationWorker(
  requestEycaActivationSaga: RequestEycaActivationSaga
) {
  yield put(navigateToEycaActivationLoading());
  yield put(navigationHistoryPop(1));

  const progress = yield call(requestEycaActivationSaga);
  yield put(progress);

  yield put(navigateToCgnDetails());
}

/**
 * This saga handles the CGN activation polling
 */
export function* eycaActivationSaga(
  requestEycaActivationSaga: RequestEycaActivationSaga
): SagaIterator {
  const { cancelAction } = yield race({
    activation: call(eycaActivationWorker, requestEycaActivationSaga),
    cancelAction: take(cgnEycaActivationCancel)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
