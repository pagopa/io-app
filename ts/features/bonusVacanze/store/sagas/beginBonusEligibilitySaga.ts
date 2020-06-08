import { fromNullable } from "fp-ts/lib/Option";
import { call, put, select } from "redux-saga/effects";
import { RTron } from "../../../../boot/configureStoreAndPersistor";
import { apiUrlPrefix } from "../../../../config";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import {
  navigateToActivateBonus,
  navigateToBonusEligibilityLoading,
  navigateToIseeNotAvailable,
  navigateToIseeNotEligible,
  navigateToTimeoutEligibilityCheck
} from "../../navigation/action";
import {
  eligibilityCheckRequestProgress,
  EligibilityRequestProgressEnum
} from "../reducers/eligibility";
import { startBonusEligibilitySaga } from "./startBonusEligibilitySaga";

const eligibilityToNavigate = new Map([
  [EligibilityRequestProgressEnum.ELIGIBLE, navigateToActivateBonus],
  [EligibilityRequestProgressEnum.INELIGIBLE, navigateToIseeNotEligible],
  [EligibilityRequestProgressEnum.ISEE_NOT_FOUND, navigateToIseeNotAvailable],
  [EligibilityRequestProgressEnum.TIMEOUT, navigateToTimeoutEligibilityCheck]
]);

export function* beginBonusEligibilitySaga() {
  const backendBonusVacanze = BackendBonusVacanze(apiUrlPrefix);
  yield put(navigateToBonusEligibilityLoading());
  yield call(
    startBonusEligibilitySaga,
    backendBonusVacanze.startBonusEligibilityCheck,
    backendBonusVacanze.getBonusEligibilityCheck
  );
  const progress = yield select(eligibilityCheckRequestProgress);
  const nextNavigation = fromNullable(
    eligibilityToNavigate.get(progress)
  ).getOrElse(navigateToBonusEligibilityLoading);
  yield put(nextNavigation());

  RTron.log("beginBonusEligibilitySaga! " + progress + nextNavigation);
}
