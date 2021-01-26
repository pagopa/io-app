import { SagaIterator } from "redux-saga";
import { call, put, race, take } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import {
  cgnActivationCancel,
  cgnActivationComplete,
  cgnRequestActivation
} from "../../../store/actions/activation";
import { navigateToCgnActivationInformationTos } from "../../../navigation/actions";

export function* cgnStartActivationWorker() {
  yield put(navigateToCgnActivationInformationTos());
  yield put(navigationHistoryPop(1));

  yield take(cgnRequestActivation.request);

  yield take(cgnActivationComplete);
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
