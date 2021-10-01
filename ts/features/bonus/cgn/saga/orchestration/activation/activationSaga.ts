import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnActivationComplete,
  cgnActivationFailure
} from "../../../store/actions/activation";
import { navigateToCgnActivationInformationTos } from "../../../navigation/actions";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import CGN_ROUTES from "../../../navigation/routes";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { navigateBack } from "../../../../../../store/actions/navigation";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import BONUSVACANZE_ROUTES from "../../../../bonusVacanze/navigation/routes";

function* cgnActivationWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToCgnActivationInformationTos(),
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
  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    withResetNavigationStack,
    cgnActivationWorkUnit
  );

  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> =
    yield select(navigationCurrentRouteSelector);
  const route = currentRoute.toUndefined();
  if (
    // if the activation started from the CTA -> go back
    route === CGN_ROUTES.CTA_START_CGN ||
    // if the activation started from the bonus list and user aborted the activation -> go back
    (res === "cancel" && route === BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST)
  ) {
    yield put(navigateBack());
  }
}
