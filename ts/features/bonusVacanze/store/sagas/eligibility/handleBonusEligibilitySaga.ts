import { fromNullable } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, select, take } from "redux-saga/effects";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../store/reducers/navigation";
import {
  navigateToActivateBonus,
  navigateToBonusEligibilityLoading,
  navigateToIseeNotAvailable,
  navigateToIseeNotEligible,
  navigateToTimeoutEligibilityCheck
} from "../../../navigation/action";
import BONUSVACANZE_ROUTES from "../../../navigation/routes";
import {
  cancelBonusEligibility,
  completeBonusEligibility
} from "../../actions/bonusVacanze";
import {
  EligibilityRequestProgressEnum,
  eligibilityRequestProgressSelector
} from "../../reducers/eligibility";
import { getBonusEligibilitySaga } from "./getBonusEligibilitySaga";

const eligibilityToNavigate = new Map([
  [EligibilityRequestProgressEnum.ELIGIBLE, navigateToActivateBonus],
  [EligibilityRequestProgressEnum.INELIGIBLE, navigateToIseeNotEligible],
  [EligibilityRequestProgressEnum.ISEE_NOT_FOUND, navigateToIseeNotAvailable],
  [EligibilityRequestProgressEnum.TIMEOUT, navigateToTimeoutEligibilityCheck]
]);

export const isLoadingScreen = (screenName: string) =>
  screenName === BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK_LOADING;

export function* eligibilityWorker(bearerToken: string) {
  const currentState = yield select(navigationCurrentRouteSelector);

  if (!isLoadingScreen(currentState.routeName)) {
    // show the loading page for the check eligibility
    yield put(navigateToBonusEligibilityLoading());
  }

  // start and wait for network request
  yield call(getBonusEligibilitySaga, bearerToken);
  // read eligibility outcome from store (TODO: better return results from saga??)
  const progress = yield select(eligibilityRequestProgressSelector);
  // choose next page for navigation

  const nextNavigation = fromNullable(
    eligibilityToNavigate.get(progress)
  ).getOrElse(navigateToBonusEligibilityLoading);
  if (nextNavigation !== navigateToBonusEligibilityLoading) {
    // the eligibility saga terminate with a transition to the next screen, removing from the history
    // the loading screen
    yield put(nextNavigation());
    yield put(navigationHistoryPop(1));
  }

  // waiting for the event of completition in order to handle the intermediate cancel events
  yield take(completeBonusEligibility);
}

/**
 * Entry point; This saga orchestrate the check eligibility phase.
 */
export function* handleBonusEligibilitySaga(bearerToken: string): SagaIterator {
  // an event of checkBonusEligibility.request trigger a new workflow for the eligibility

  const { cancelAction } = yield race({
    eligibility: call(eligibilityWorker, bearerToken),
    cancelAction: take(cancelBonusEligibility)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
