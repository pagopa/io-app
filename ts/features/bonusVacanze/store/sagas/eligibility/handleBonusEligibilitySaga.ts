import { fromNullable } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, select, take, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
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
  checkBonusEligibility
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

export function* eligibilityWorker() {
  const currentState = yield select(navigationCurrentRouteSelector);

  if (!isLoadingScreen(currentState.routeName)) {
    // show the loading page for the check eligibility
    yield put(navigateToBonusEligibilityLoading());
  }

  // start and wait for network request
  yield call(getBonusEligibilitySaga);
  // read eligibility outcome from store (TODO: better return results from saga??)
  const progress = yield select(eligibilityRequestProgressSelector);
  // choose next page for navigation

  const nextNavigation = fromNullable(
    eligibilityToNavigate.get(progress)
  ).getOrElse(navigateToBonusEligibilityLoading);
  if (nextNavigation !== navigateToBonusEligibilityLoading) {
    yield put(nextNavigation());
    yield put(navigationHistoryPop(1));
  }
}

export function* handleCancelEligibilitySaga() {
  yield put(NavigationActions.back());
}

function* beginBonusEligibilitySaga() {
  yield race({
    eligibility: call(eligibilityWorker),
    cancelAction: take(cancelBonusEligibility)
  });
}

/**
 * This saga orchestrate the check eligibility phase.
 */
export function* handleBonusEligibilitySaga(): SagaIterator {
  // begin the workflow: request a bonus eligibility
  yield takeLatest(
    getType(checkBonusEligibility.request),
    beginBonusEligibilitySaga
  );
  yield takeLatest(
    getType(cancelBonusEligibility),
    handleCancelEligibilitySaga
  );
}
