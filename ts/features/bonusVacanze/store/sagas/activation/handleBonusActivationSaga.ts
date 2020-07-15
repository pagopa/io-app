import { fromNullable } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, select, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../types/utils";
import {
  navigateToBonusActivationCompleted,
  navigateToBonusActivationLoading,
  navigateToBonusActivationTimeout,
  navigateToBonusActiveDetailScreen,
  navigateToBonusAlreadyExists,
  navigateToEligibilityExpired
} from "../../../navigation/action";
import BONUSVACANZE_ROUTES from "../../../navigation/routes";
import {
  activateBonusVacanze,
  cancelBonusVacanzeRequest,
  checkBonusVacanzeEligibility,
  completeBonusVacanzeActivation,
  showBonusVacanze
} from "../../actions/bonusVacanze";
import { BonusActivationProgressEnum } from "../../reducers/activation";
import { bonusActivationSaga } from "./getBonusActivationSaga";

export const activationToNavigate = new Map([
  [BonusActivationProgressEnum.SUCCESS, navigateToBonusActivationCompleted],
  [BonusActivationProgressEnum.TIMEOUT, navigateToBonusActivationTimeout],
  [
    BonusActivationProgressEnum.ELIGIBILITY_EXPIRED,
    navigateToEligibilityExpired
  ],
  [BonusActivationProgressEnum.EXISTS, navigateToBonusAlreadyExists]
]);

type BonusActivationSagaType = ReturnType<typeof bonusActivationSaga>;
type NavigationCurrentRouteSelectorType = ReturnType<
  typeof navigationCurrentRouteSelector
>;
type BonusActivationType = SagaCallReturnType<BonusActivationSagaType>;

/**
 * based on the result of activation, calculate the next screen
 * @param result
 */
export const getNextNavigation = (result: BonusActivationType) =>
  result.type === getType(activateBonusVacanze.success)
    ? fromNullable(activationToNavigate.get(result.payload.status)).getOrElse(
        navigateToBonusActivationLoading
      )
    : navigateToBonusActivationLoading;

export const isLoadingScreen = (screenName: string) =>
  screenName === BONUSVACANZE_ROUTES.ACTIVATION.LOADING;

export function* activationWorker(activationSaga: BonusActivationSagaType) {
  const currentRoute: NavigationCurrentRouteSelectorType = yield select(
    navigationCurrentRouteSelector
  );
  if (currentRoute.isSome() && !isLoadingScreen(currentRoute.value)) {
    // show the loading page for the activation
    yield put(navigateToBonusActivationLoading());
    yield put(navigationHistoryPop(1));
  }

  // start and wait for network request
  const progress: BonusActivationType = yield call(activationSaga);
  // dispatch the progress
  yield put(progress);
  // read activation outcome if check has ended successfully
  const nextNavigation = getNextNavigation(progress);
  if (nextNavigation !== navigateToBonusActivationLoading) {
    // the activation saga terminate with a transition to the next screen, removing from the history
    // the loading screen
    yield put(nextNavigation());
    yield put(navigationHistoryPop(1));
  }

  // the saga complete with the bonusVacanzeActivation.request action
  yield take(completeBonusVacanzeActivation);

  if (
    progress.type === getType(activateBonusVacanze.success) &&
    progress.payload.activation
  ) {
    yield put(
      navigateToBonusActiveDetailScreen({ bonus: progress.payload.activation })
    );
    // remove the congratulation screen from the navigation stack
    yield put(navigationHistoryPop(1));
  } else {
    // to avoid leaving the user stuck in this screen in case of lack of payload, return to wallet
    yield put(navigateToWalletHome());
    yield put(navigationHistoryPop(1));
  }
}

/**
 * Entry point; This saga orchestrate the activation phase.
 * There are two condition to exit from this saga:
 * - cancelBonusActivation
 * - completeBonusVacanze
 */
export function* handleBonusActivationSaga(
  activationSaga: BonusActivationSagaType
): SagaIterator {
  // an event of bonusVacanzeActivation.request trigger a new workflow for the activation

  const { cancelAction, showAction } = yield race({
    activation: call(activationWorker, activationSaga),
    cancelAction: take(cancelBonusVacanzeRequest),
    showAction: take(showBonusVacanze),
    restartEligibility: take(checkBonusVacanzeEligibility.request)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  } else if (showAction) {
    yield put(navigateToWalletHome());
    yield put(navigationHistoryPop(1));
  }
}
