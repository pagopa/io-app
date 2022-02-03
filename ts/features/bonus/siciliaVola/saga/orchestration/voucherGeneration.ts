import { SagaIterator } from "redux-saga";
import { call } from "typed-redux-saga/macro";
import NavigationService from "../../../../../navigation/NavigationService";
import {
  executeWorkUnit,
  withResetNavigationStack
} from "../../../../../sagas/workUnit";
import {
  navigateBack,
  navigateToWorkunitGenericFailureScreen
} from "../../../../../store/actions/navigation";
import { SagaCallReturnType } from "../../../../../types/utils";
import { navigateToSvCheckStatusRouterScreen } from "../../navigation/actions";
import SV_ROUTES from "../../navigation/routes";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherCompleted,
  svGenerateVoucherFailure
} from "../../store/actions/voucherGeneration";

/**
 * Define the workflow that allows the user to generate a new voucher.
 * The workflow ends when:
 * - The user send the request to generate a new voucher {@link svGenerateVoucherCompleted}
 * - The user aborts the voucher generation {@link svGenerateVoucherCancel}
 * - The user chooses back from the first screen {@link svGenerateVoucherBack}
 */
function* svVoucherGenerationWorkUnit() {
  return yield* call(executeWorkUnit, {
    startScreenNavigation: navigateToSvCheckStatusRouterScreen,
    startScreenName: SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS,
    complete: svGenerateVoucherCompleted,
    back: svGenerateVoucherBack,
    cancel: svGenerateVoucherCancel,
    failure: svGenerateVoucherFailure
  });
}

/**
 * This saga handles the SV activation workflow
 */
export function* handleSvVoucherGenerationStartActivationSaga(): SagaIterator {
  const initialRoute: ReturnType<typeof NavigationService.getCurrentRouteName> =
    yield* call(NavigationService.getCurrentRouteName);

  const sagaExecution = () =>
    withResetNavigationStack(svVoucherGenerationWorkUnit);

  const res: SagaCallReturnType<typeof executeWorkUnit> = yield* call(
    sagaExecution
  );

  if (
    // if the activation started from the CTA -> go back
    initialRoute === SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS
  ) {
    yield* call(navigateBack);
  }

  if (res === "failure") {
    yield* call(navigateToWorkunitGenericFailureScreen);
  }
}
