import { fromNullable } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, select, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../types/utils";
import {
  navigateToActivateBonus,
  navigateToBonusEligibilityLoading
} from "../../../navigation/action";
import BONUSVACANZE_ROUTES from "../../../navigation/routes";
import {
  bonusVacanzeActivation,
  cancelBonusEligibility
} from "../../actions/bonusVacanze";
import { BonusActivationProgressEnum } from "../../reducers/bonusVacanzeActivation";
import { bonusActivationSaga } from "./getBonusActivationSaga";

const eligibilityToNavigate = new Map([
  [BonusActivationProgressEnum.SUCCESS, navigateToActivateBonus]
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
  result.type === getType(bonusVacanzeActivation.success)
    ? fromNullable(eligibilityToNavigate.get(result.payload.status)).getOrElse(
        navigateToBonusEligibilityLoading
      )
    : navigateToBonusEligibilityLoading;

export const isLoadingScreen = (screenName: string) =>
  screenName === BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK_LOADING;

export function* eligibilityWorker(eligibilitySaga: BonusActivationSagaType) {
  const currentRoute: NavigationCurrentRouteSelectorType = yield select(
    navigationCurrentRouteSelector
  );
  if (currentRoute.isSome() && !isLoadingScreen(currentRoute.value)) {
    // show the loading page for the check eligibility
    yield put(navigateToBonusEligibilityLoading());
  }

  // start and wait for network request
  const progress: BonusActivationType = yield call(eligibilitySaga);
  // dispatch the progress
  yield put(progress);
  // read eligibility outcome if check has ended successfully
  const nextNavigation = getNextNavigation(progress);
  if (nextNavigation !== navigateToBonusEligibilityLoading) {
    // the eligibility saga terminate with a transition to the next screen, removing from the history
    // the loading screen
    yield put(nextNavigation());
    yield put(navigationHistoryPop(1));
  }

  // the saga complete with the bonusVacanzeActivation.request action
  yield take(bonusVacanzeActivation.request);
}

/**
 * Entry point; This saga orchestrate the activation phase.
 * There are two condition to exit from this saga:
 * - cancelBonusEligibility
 * - bonusVacanzeActivation.request
 */
export function* handleBonusActivationSaga(
  activationSaga: BonusActivationSagaType
): SagaIterator {
  // an event of checkBonusEligibility.request trigger a new workflow for the eligibility

  const { cancelAction } = yield race({
    eligibility: call(eligibilityWorker, activationSaga),
    cancelAction: take(cancelBonusEligibility)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
