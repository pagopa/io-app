import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import NavigationService from "../../../../../../navigation/NavigationService";
import ROUTES from "../../../../../../navigation/routes";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import { navigateBack } from "../../../../../../store/actions/navigation";
import { SagaCallReturnType } from "../../../../../../types/utils";
import BONUSVACANZE_ROUTES from "../../../../bonusVacanze/navigation/routes";
import {
  navigateToCgnActivationInformationTos,
  navigateToCgnDetails
} from "../../../navigation/actions";
import CGN_ROUTES from "../../../navigation/routes";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnActivationComplete,
  cgnActivationFailure
} from "../../../store/actions/activation";

function* cgnActivationWorkUnit() {
  return yield* call(executeWorkUnit, {
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
  const initialScreen: ReturnType<typeof NavigationService.getCurrentRoute> =
    yield* call(NavigationService.getCurrentRoute);

  const sagaExecution = () => withResetNavigationStack(cgnActivationWorkUnit);
  const result: SagaCallReturnType<typeof executeWorkUnit> = yield* call(
    sagaExecution
  );

  if (initialScreen?.name === CGN_ROUTES.ACTIVATION.CTA_START_CGN) {
    yield* call(NavigationService.navigate, ROUTES.MESSAGES_HOME);
  }
  if (result === "completed") {
    if (initialScreen?.name === BONUSVACANZE_ROUTES.BONUS_AVAILABLE_LIST) {
      yield* call(navigateBack);
    }
    yield* call(navigateToCgnDetails);
  }
}
