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
  navigateToBonusEligibilityLoading,
  navigateToIseeNotAvailable,
  navigateToIseeNotEligible,
  navigateToTimeoutEligibilityCheck
} from "../../../navigation/action";
import BONUSVACANZE_ROUTES from "../../../navigation/routes";
import {
  cancelBonusEligibility,
  checkBonusEligibility,
  completeBonusEligibility
} from "../../actions/bonusVacanze";
import { EligibilityRequestProgressEnum } from "../../reducers/eligibility";
import { bonusEligibilitySaga } from "./getBonusEligibilitySaga";

const eligibilityToNavigate = new Map([
  [EligibilityRequestProgressEnum.ELIGIBLE, navigateToActivateBonus],
  [EligibilityRequestProgressEnum.INELIGIBLE, navigateToIseeNotEligible],
  [EligibilityRequestProgressEnum.ISEE_NOT_FOUND, navigateToIseeNotAvailable],
  [EligibilityRequestProgressEnum.TIMEOUT, navigateToTimeoutEligibilityCheck]
]);

export const isLoadingScreen = (screenName: string) =>
  screenName === BONUSVACANZE_ROUTES.ELIGIBILITY.CHECK_LOADING;

export function* eligibilityWorker(
  eligibilitySaga: ReturnType<typeof bonusEligibilitySaga>
) {
  const currentRoute: ReturnType<
    typeof navigationCurrentRouteSelector
  > = yield select(navigationCurrentRouteSelector);
  if (currentRoute.isSome() && !isLoadingScreen(currentRoute.value)) {
    // show the loading page for the check eligibility
    yield put(navigateToBonusEligibilityLoading());
  }

  // start and wait for network request
  const progress: SagaCallReturnType<typeof eligibilitySaga> = yield call(
    eligibilitySaga
  );
  // dispatch the progress
  yield put(progress);
  // read eligibility outcome from store
  const nextNavigation =
    progress.type === getType(checkBonusEligibility.success)
      ? fromNullable(
          eligibilityToNavigate.get(progress.payload.status)
        ).getOrElse(navigateToBonusEligibilityLoading)
      : navigateToBonusEligibilityLoading;
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
export function* handleBonusEligibilitySaga(
  eligibilitySaga: ReturnType<typeof bonusEligibilitySaga>
): SagaIterator {
  // an event of checkBonusEligibility.request trigger a new workflow for the eligibility

  const { cancelAction } = yield race({
    eligibility: call(eligibilityWorker, eligibilitySaga),
    cancelAction: take(cancelBonusEligibility)
  });
  if (cancelAction) {
    yield put(NavigationActions.back());
  }
}
