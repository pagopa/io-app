import { SagaIterator } from "redux-saga";
import { call, put, race, take } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import {
  cgnActivationCancel,
  cgnActivationStatus
} from "../../actions/activation";
import { navigateToCgnOnboardingInformationTos } from "../../../navigation/actions";

export function* cgnStartActivationWorker() {
  yield put(navigateToCgnOnboardingInformationTos());
  yield put(navigationHistoryPop(1));

  // TODO :HERE WILL BE IMPLEMENTED THE ACTIVATION LOGIC
  // WIP remove this instruction when the activation flow will be implemented
  yield take(cgnActivationStatus.request);
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
