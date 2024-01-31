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
import {
  svGenerateVoucherBack,
  svGenerateVoucherCancel,
  svGenerateVoucherCompleted
} from "../../store/actions/voucherGeneration";

/**
 * Define the workflow that allows the user to generate a new voucher.
 * The workflow ends when:
 * - The user send the request to generate a new voucher {@link svGenerateVoucherCompleted}
 * - The user aborts the voucher generation {@link svGenerateVoucherCancel}
 * - The user chooses back from the first screen {@link svGenerateVoucherBack}
 */
// eslint-disable-next-line require-yield
function* svVoucherGenerationWorkUnit() {
  return null;
}

/**
 * This saga handles the SV activation workflow
 */
export function* handleSvVoucherGenerationStartActivationSaga(): SagaIterator {
  const initialRoute: ReturnType<typeof NavigationService.getCurrentRouteName> =
    yield* call(NavigationService.getCurrentRouteName);

  const sagaExecution = () =>
    withResetNavigationStack(svVoucherGenerationWorkUnit);

  const res: SagaCallReturnType<typeof executeWorkUnit> | null = yield* call(
    sagaExecution
  );

  if (
    // if the activation started from the CTA -> go back
    initialRoute === null
  ) {
    yield* call(navigateBack);
  }

  if (res === "failure") {
    yield* call(navigateToWorkunitGenericFailureScreen);
  }
}
