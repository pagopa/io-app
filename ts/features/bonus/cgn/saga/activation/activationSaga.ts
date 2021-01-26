import { SagaIterator } from "redux-saga";
import { call, delay, put, race, take } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import {
  cgnActivationCancel,
  cgnRequestActivation
} from "../../store/actions/activation";
import {
  navigateToCgnActivationCompleted,
  navigateToCgnActivationInformationTos,
  navigateToCgnActivationLoading
} from "../../navigation/actions";

export function* cgnStartActivationWorker() {
  yield put(navigateToCgnActivationInformationTos());
  yield put(navigationHistoryPop(1));

  yield take(cgnRequestActivation.request);

  yield put(navigateToCgnActivationLoading());
  yield put(navigationHistoryPop(1));

  // UNCOMMENT when api implementation has been completed
  // yield take(cgnRequestActivation.success);
  // yield put(cgnActivationStatus.request());

  yield delay(1000);

  yield put(navigateToCgnActivationCompleted());
  yield put(navigationHistoryPop(1));
}

/**
 * This saga handles the CGN activation workflow
 */
export function* handleCgnStartActivationSaga(): SagaIterator {
  const { cancelAction } = yield race({
    activation: call(cgnStartActivationWorker),
    cancelAction: take(cgnActivationCancel)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
