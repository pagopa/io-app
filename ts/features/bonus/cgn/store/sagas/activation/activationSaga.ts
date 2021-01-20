import { SagaIterator } from "redux-saga";
import { call, put, race, take } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import {
  cgnActivationCancel,
  cgnActivationStatus,
  cgnRequestActivation
} from "../../actions/activation";
import {
  navigateToCgnActivationCompleted,
  navigateToCgnActivationInformationTos,
  navigateToCgnActivationLoading
} from "../../../navigation/actions";
import { CgnActivationProgressEnum } from "../../reducers/activation";

export function* cgnStartActivationWorker() {
  yield put(navigateToCgnActivationInformationTos());
  yield put(navigationHistoryPop(1));

  yield take(cgnRequestActivation.request);

  yield put(navigateToCgnActivationLoading());
  yield put(navigationHistoryPop(1));

  yield take(cgnRequestActivation.success);
  yield put(cgnActivationStatus.request());

  // PLACEHOLDER here we should handle the polling for activation status with a dedicated function
  const result: ReturnType<typeof cgnActivationStatus.success> = yield take(
    cgnActivationStatus.success
  );

  switch (result.payload.status) {
    case CgnActivationProgressEnum.SUCCESS:
      yield put(navigateToCgnActivationCompleted());
      break;
  }
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
