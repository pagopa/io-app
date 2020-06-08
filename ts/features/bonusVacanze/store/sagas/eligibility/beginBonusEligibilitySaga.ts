import { fromNullable } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { call, cancelled, put, race, select, take } from "redux-saga/effects";
import { apiUrlPrefix } from "../../../../../config";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { BackendBonusVacanze } from "../../../api/backendBonusVacanze";
import {
  navigateToActivateBonus,
  navigateToBonusEligibilityLoading,
  navigateToIseeNotAvailable,
  navigateToIseeNotEligible,
  navigateToTimeoutEligibilityCheck
} from "../../../navigation/action";
import { cancelBonusEligibility } from "../../actions/bonusVacanze";
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

export function* eligibilityWorker() {
  try {
    const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);
    // show the loading page for the check eligibility
    yield put(navigateToBonusEligibilityLoading());
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
    yield put(nextNavigation());
    yield put(navigationHistoryPop(1));
  } finally {
    if (yield cancelled()) {
      yield put(NavigationActions.back());
    }
  }
}

/**
 * This saga orchestrate the check eligibility phase.
 */
export function* beginBonusEligibilitySaga() {
  yield race({
    eligibility: call(eligibilityWorker),
    cancelAction: take(cancelBonusEligibility)
  });
}
