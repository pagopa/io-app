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
  navigateToBonusActivationPending,
  navigateToBonusAlreadyExists,
  navigateToBonusEligibilityLoading,
  navigateToEligible,
  navigateToIseeNotAvailable,
  navigateToIseeNotEligible,
  navigateToTimeoutEligibilityCheck
} from "../../../navigation/action";
import BONUSVACANZE_ROUTES from "../../../navigation/routes";
import {
  activateBonusVacanze,
  cancelBonusVacanzeRequest,
  checkBonusVacanzeEligibility,
  showBonusVacanze
} from "../../actions/bonusVacanze";
import { EligibilityRequestProgressEnum } from "../../reducers/eligibility";
import { bonusEligibilitySaga } from "./getBonusEligibilitySaga";

const eligibilityToNavigate = new Map([
  [EligibilityRequestProgressEnum.ELIGIBLE, navigateToEligible],
  [EligibilityRequestProgressEnum.INELIGIBLE, navigateToIseeNotEligible],
  [EligibilityRequestProgressEnum.ISEE_NOT_FOUND, navigateToIseeNotAvailable],
  [EligibilityRequestProgressEnum.TIMEOUT, navigateToTimeoutEligibilityCheck],
  [
    EligibilityRequestProgressEnum.BONUS_ACTIVATION_PENDING,
    navigateToBonusActivationPending
  ],
  [EligibilityRequestProgressEnum.CONFLICT, navigateToBonusAlreadyExists]
]);

type BonusEligibilitySagaType = ReturnType<typeof bonusEligibilitySaga>;
type NavigationCurrentRouteSelectorType = ReturnType<
  typeof navigationCurrentRouteSelector
>;
type CheckBonusEligibilityType = SagaCallReturnType<BonusEligibilitySagaType>;

/**
 * based on the result of eligibilitySaga, calculate the next screen
 * @param result
 */
export const getNextNavigation = (result: CheckBonusEligibilityType) =>
  result.type === getType(checkBonusVacanzeEligibility.success)
    ? fromNullable(eligibilityToNavigate.get(result.payload.status)).getOrElse(
        navigateToBonusEligibilityLoading
      )
    : navigateToBonusEligibilityLoading;

export const isLoadingScreen = (screenName: string) =>
  screenName === BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK_LOADING;

export function* eligibilityWorker(eligibilitySaga: BonusEligibilitySagaType) {
  const currentRoute: NavigationCurrentRouteSelectorType = yield select(
    navigationCurrentRouteSelector
  );
  if (currentRoute.isSome() && !isLoadingScreen(currentRoute.value)) {
    // show the loading page for the check eligibility
    yield put(navigateToBonusEligibilityLoading());
    yield put(navigationHistoryPop(1));
  }

  // start and wait for network request
  const progress: CheckBonusEligibilityType = yield call(eligibilitySaga);
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
  yield take(activateBonusVacanze.request);
}

/**
 * Entry point; This saga orchestrate the check eligibility phase.
 * There are two condition to exit from this saga:
 * - cancelBonusEligibility
 * - bonusVacanzeActivation.request
 */
export function* handleBonusEligibilitySaga(
  eligibilitySaga: BonusEligibilitySagaType
): SagaIterator {
  // an event of checkBonusEligibility.request trigger a new workflow for the eligibility

  const { cancelAction, showAction } = yield race({
    eligibility: call(eligibilityWorker, eligibilitySaga),
    cancelAction: take(cancelBonusVacanzeRequest),
    showAction: take(showBonusVacanze)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  } else if (showAction) {
    yield put(navigateToWalletHome());
    yield put(navigationHistoryPop(1));
  }
}
