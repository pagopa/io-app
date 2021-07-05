import { call } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import {
  executeWorkUnit,
  withFailureHandling,
  withResetNavigationStack
} from "../../../../../sagas/workUnit";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherCompleted,
  svGenerateVoucherFailure
} from "../../store/actions/voucherGeneration";
import SV_ROUTES from "../../navigation/routes";
import { navigateToSvCheckStatusRouterScreen } from "../../navigation/actions";

/**
 * Define the workflow that allows the user to generate a new voucher.
 * The workflow ends when:
 * - The user send the request to generate a new voucher {@link svGenerateVoucherCompleted}
 * - The user aborts the voucher generation {@link svGenerateVoucherCancel}
 * - The user chooses back from the first screen {@link svGenerateVoucherBack}
 */
function* svVoucherGenerationWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: navigateToSvCheckStatusRouterScreen(),
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
  const sagaExecution = () =>
    withFailureHandling(() =>
      withResetNavigationStack(svVoucherGenerationWorkUnit)
    );
  yield call(sagaExecution);
}
