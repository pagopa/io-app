import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import {
  executeWorkUnit,
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
import {
  navigateBack,
  navigateToWorkunitGenericFailureScreen
} from "../../../../../store/actions/navigation";
import { navigationCurrentRouteSelector } from "../../../../../store/reducers/navigation";
import { SagaCallReturnType } from "../../../../../types/utils";

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
    withResetNavigationStack(svVoucherGenerationWorkUnit);

  const res: SagaCallReturnType<typeof executeWorkUnit> = yield call(
    sagaExecution
  );

  const currentRoute: ReturnType<typeof navigationCurrentRouteSelector> =
    yield select(navigationCurrentRouteSelector);
  const route = currentRoute.toUndefined();

  if (
    // if the activation started from the CTA -> go back
    route === SV_ROUTES.VOUCHER_GENERATION.CHECK_STATUS
  ) {
    yield put(navigateBack());
  }

  if (res === "failure") {
    yield put(navigateToWorkunitGenericFailureScreen());
  }
}
