import { fromNullable } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, select, take } from "redux-saga/effects";
import { ActionType, isActionOf } from "typesafe-actions";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import {
  navigateToCgnActivationCompleted,
  navigateToCgnActivationIneligible,
  navigateToCgnActivationLoading,
  navigateToCgnActivationPending,
  navigateToCgnActivationTimeout,
  navigateToCgnAlreadyActive
} from "../../../navigation/actions";
import CGN_ROUTES from "../../../navigation/routes";
import {
  cgnActivationCancel,
  cgnActivationStatus
} from "../../../store/actions/activation";
import { CgnActivationProgressEnum } from "../../../store/reducers/activation";
import { cgnActivationSaga } from "../../networking/activation/getBonusActivationSaga";

const mapEnumToNavigation = new Map<CgnActivationProgressEnum, () => void>([
  [CgnActivationProgressEnum.SUCCESS, navigateToCgnActivationCompleted],
  [CgnActivationProgressEnum.PENDING, navigateToCgnActivationPending],
  [CgnActivationProgressEnum.TIMEOUT, navigateToCgnActivationTimeout],
  [CgnActivationProgressEnum.INELIGIBLE, navigateToCgnActivationIneligible],
  [CgnActivationProgressEnum.EXISTS, navigateToCgnAlreadyActive]
]);

type CgnActivationType = ReturnType<typeof cgnActivationSaga>;
type NavigationCurrentRouteSelectorType = ReturnType<
  typeof navigationCurrentRouteSelector
>;

// Get the next activation steps from the saga call function based on status ENUM
const getNextNavigationStep = (
  action: ActionType<typeof cgnActivationStatus>
): (() => void) =>
  isActionOf(cgnActivationStatus.success, action)
    ? fromNullable(mapEnumToNavigation.get(action.payload.status)).getOrElse(
        navigateToCgnActivationLoading
      )
    : navigateToCgnActivationLoading;

export const isLoadingScreen = (screenName: string) =>
  screenName === CGN_ROUTES.ACTIVATION.LOADING;

export function* cgnActivationWorker(cgnActivationSaga: CgnActivationType) {
  const currentRoute: NavigationCurrentRouteSelectorType = yield select(
    navigationCurrentRouteSelector
  );
  if (currentRoute.isSome() && !isLoadingScreen(currentRoute.value)) {
    // show the loading page for the CGN activation
    yield call(navigateToCgnActivationLoading);
    yield put(navigationHistoryPop(1));
  }

  const progress = yield call(cgnActivationSaga);
  yield put(progress);

  const nextNavigationStep = getNextNavigationStep(progress);
  if (nextNavigationStep !== navigateToCgnActivationLoading) {
    yield call(nextNavigationStep);
    yield put(navigationHistoryPop(1));
  }
}

/**
 * This saga handles the CGN activation polling
 */
export function* handleCgnActivationSaga(
  cgnActivationSaga: CgnActivationType
): SagaIterator {
  const { cancelAction } = yield race({
    activation: call(cgnActivationWorker, cgnActivationSaga),
    cancelAction: take(cgnActivationCancel)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
