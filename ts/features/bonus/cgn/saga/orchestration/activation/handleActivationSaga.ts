import { SagaIterator } from "redux-saga";
import { call, put, race, select, take } from "redux-saga/effects";
import { NavigationActions, NavigationNavigateAction } from "react-navigation";
import { ActionType, isActionOf } from "typesafe-actions";
import { fromNullable } from "fp-ts/lib/Option";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import {
  cgnActivationCancel,
  cgnActivationStatus
} from "../../../store/actions/activation";
import {
  navigateToCgnActivationCompleted,
  navigateToCgnActivationIneligible,
  navigateToCgnActivationLoading,
  navigateToCgnActivationPending,
  navigateToCgnActivationTimeout,
  navigateToCgnAlreadyActive
} from "../../../navigation/actions";
import { CgnActivationProgressEnum } from "../../../store/reducers/activation";
import CGN_ROUTES from "../../../navigation/routes";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import { cgnActivationSaga } from "../../networking/activation/getBonusActivationSaga";

const mapEnumToNavigation = new Map<
  CgnActivationProgressEnum,
  () => NavigationNavigateAction
>([
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
): (() => NavigationNavigateAction) =>
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
    yield put(navigateToCgnActivationLoading());
    yield put(navigationHistoryPop(1));
  }

  const progress = yield call(cgnActivationSaga);
  yield put(progress);

  const nextNavigationStep = getNextNavigationStep(progress);
  if (nextNavigationStep !== navigateToCgnActivationLoading) {
    yield put(nextNavigationStep());
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
