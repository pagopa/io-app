import { fromNullable } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { SagaIterator } from "redux-saga";
import { call, put, race, select, take, takeLatest } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { apiUrlPrefix } from "../../../../../config";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { navigationCurrentStateSelector } from "../../../../../store/reducers/navigation";
import { BackendBonusVacanze } from "../../../api/backendBonusVacanze";
import {
  navigateToActivateBonus,
  navigateToBonusEligibilityLoading,
  navigateToIseeNotAvailable,
  navigateToIseeNotEligible,
  navigateToTimeoutEligibilityCheck
} from "../../../navigation/action";
import BONUSVACANZE_ROUTES from "../../../navigation/routes";
import {
  beginBonusEligibility,
  cancelBonusEligibility
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
  const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);

  const currentState = yield select(navigationCurrentStateSelector);

  if (!isLoadingScreen(currentState.routeName)) {
    // show the loading page for the check eligibility
    yield put(navigateToBonusEligibilityLoading());
  }

  // start and wait for network request
  yield call(
    getBonusEligibilitySaga,
    backendBonusVacanze.startBonusEligibilityCheck,
    backendBonusVacanze.getBonusEligibilityCheck
  );
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

/**
 * This saga orchestrate the check eligibility phase.
 */
export function* handleBonusEligibilitySaga(): SagaIterator {
  // begin the workflow: request a bonus eligibility
  yield takeLatest(getType(beginBonusEligibility), beginBonusEligibilitySaga);
  yield takeLatest(
    getType(cancelBonusEligibility),
    handleCancelEligibilitySaga
  );
}

export function* beginBonusEligibilitySaga() {
  yield race({
    eligibility: call(eligibilityWorker),
    cancelAction: take(cancelBonusEligibility)
  });
}
