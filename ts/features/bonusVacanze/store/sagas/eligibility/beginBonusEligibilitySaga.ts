import { fromNullable } from "fp-ts/lib/Option";
import { call, cancelled, put, race, select, take } from "redux-saga/effects";
import { apiUrlPrefix } from "../../../../../config";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
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
  eligibilityCheckRequestProgress,
  EligibilityRequestProgressEnum
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
    const progress = yield select(eligibilityCheckRequestProgress);
    // choose next page for navigation
    const nextNavigation = fromNullable(
      eligibilityToNavigate.get(progress)
    ).getOrElse(navigateToBonusEligibilityLoading);
    yield put(nextNavigation());
  } finally {
    if (yield cancelled()) {
      yield put(navigateToWalletHome());
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
