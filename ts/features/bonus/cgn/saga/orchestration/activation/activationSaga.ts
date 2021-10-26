import { StackActions } from "react-navigation";
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

  if (initialScreenName !== undefined) {
    // If we start from the CTA, we should remove the fake CTA screen
    if (initialScreenName === CGN_ROUTES.ACTIVATION.CTA_START_CGN) {
      yield call(
        NavigationService.dispatchNavigationAction,
        StackActions.popToTop()
      );
      yield call(navigateBack);
      // If we start from the BONUS_AVAILABLE_LIST, we should return to the wallet
    } else if (
      res === "cancel" &&
      initialScreenName === BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST
    ) {
      yield call(navigateBack);
    }
  }
}
