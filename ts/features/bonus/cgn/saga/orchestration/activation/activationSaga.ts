import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import NavigationService from "../../../../../../navigation/NavigationService";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { navigateBack } from "../../../../../../store/actions/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import BONUSVACANZE_ROUTES from "../../../../bonusVacanze/navigation/routes";
import { navigateToCgnActivationInformationTos } from "../../../navigation/actions";
import CGN_ROUTES from "../../../navigation/routes";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnActivationComplete,
  cgnActivationFailure
} from "../../../store/actions/activation";

function* cgnActivationWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToCgnActivationInformationTos,
    startScreenName: CGN_ROUTES.ACTIVATION.INFORMATION_TOS,
    complete: cgnActivationComplete,
    back: cgnActivationBack,
    cancel: cgnActivationCancel,
    failure: cgnActivationFailure
  });
}

/**
 * This saga handles the CGN activation workflow
 */
export function* handleCgnStartActivationSaga(): SagaIterator {
  const initialScreenName: ReturnType<
    typeof NavigationService.getCurrentRouteKey
  > = yield call(NavigationService.getCurrentRouteName);
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    cgnActivationWorkUnit
  );

  const initialRouteRequireBack =
    initialScreenName !== undefined &&
    (initialScreenName === CGN_ROUTES.CTA_START_CGN ||
      (res === "cancel" &&
        initialScreenName === BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST));

  // if the activation started from the CTA or the bonus list and user aborted the activation -> go back
  if (initialRouteRequireBack) {
    yield call(navigateBack);
  }
}
