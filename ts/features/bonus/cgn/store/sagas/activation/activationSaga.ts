import { SagaIterator } from "redux-saga";
import { call, put, race, take } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import { ActionType, isActionOf } from "typesafe-actions";
import { fromNullable } from "fp-ts/lib/Option";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import {
  cgnActivationCancel,
  cgnActivationComplete,
  cgnActivationStatus,
  cgnRequestActivation
} from "../../actions/activation";
import {
  navigateToCgnActivationCompleted,
  navigateToCgnActivationIneligible,
  navigateToCgnActivationInformationTos,
  navigateToCgnActivationLoading,
  navigateToCgnActivationPending,
  navigateToCgnActivationTimeout
} from "../../../navigation/actions";
import { CgnActivationProgressEnum } from "../../reducers/activation";
import { cgnActivationSaga } from "./getBonusActivationSaga";

const mapEnumToNavigation = new Map([
  [CgnActivationProgressEnum.SUCCESS, navigateToCgnActivationCompleted],
  [CgnActivationProgressEnum.PENDING, navigateToCgnActivationPending],
  [CgnActivationProgressEnum.TIMEOUT, navigateToCgnActivationTimeout],
  [CgnActivationProgressEnum.INELIGIBLE, navigateToCgnActivationIneligible],
  [CgnActivationProgressEnum.EXISTS, navigateToCgnActivationCompleted]
]);

type CgnActivationType = ReturnType<typeof cgnActivationSaga>;

// Get the next activation steps from the saga call function based on status ENUM
const getNextNavigationStep = (
  action: ActionType<typeof cgnActivationStatus>
) =>
  isActionOf(cgnActivationStatus.success, action)
    ? fromNullable(mapEnumToNavigation.get(action.payload.status)).getOrElse(
        navigateToCgnActivationLoading
      )
    : navigateToCgnActivationLoading;

export function* cgnStartActivationWorker(
  cgnActivationSaga: CgnActivationType
) {
  yield put(navigateToCgnActivationInformationTos());
  yield put(navigationHistoryPop(1));

  yield take(cgnRequestActivation.request);

  yield put(navigateToCgnActivationLoading());
  yield put(navigationHistoryPop(1));

  const progress = yield call(cgnActivationSaga);
  yield put(progress);

  const nextNavigationStep = getNextNavigationStep(progress);
  if (nextNavigationStep !== navigateToCgnActivationLoading) {
    yield put(nextNavigationStep());
    yield put(navigationHistoryPop(1));
  }

  yield take(cgnActivationComplete);
}

/**
 * This saga handles the CGN activation workflow
 */
export function* handleCgnStartActivationSaga(
  cgnActivationSaga: CgnActivationType
): SagaIterator {
  const { cancelAction } = yield race({
    activation: call(cgnStartActivationWorker, cgnActivationSaga),
    cancelAction: take(cgnActivationCancel)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
