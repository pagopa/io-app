import { call, put } from "redux-saga/effects";
import { NavigationActions } from "react-navigation";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import { take } from "redux-saga-test-plan/matchers";
import NavigationService from "../../../../../../navigation/NavigationService";
import {
  optInPaymentMethodsBack,
  optInPaymentMethodsCancel,
  optInPaymentMethodsCompleted,
  optInPaymentMethodsFailure
} from "../../../store/actions/optInPaymentMethods";
import {
  executeWorkUnit,
  withFailureHandling,
  withResetNavigationStack
} from "../../../../../../sagas/workUnit";
import BPD_ROUTES from "../../../navigation/routes";
import { deleteAllPaymentMethodsByFunction } from "../../../../../../store/actions/wallet/delete";
import { EnableableFunctionsEnum } from "../../../../../../../definitions/pagopa/EnableableFunctions";
import { bpdUpdateOptInStatusMethod } from "../../../store/actions/onboarding";
import { CitizenOptInStatusEnum } from "../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";

function* optInPaymentMethodsWorkUnit() {
  return yield call(executeWorkUnit, {
    startScreenNavigation: () => {
      NavigationService.dispatchNavigationAction(
        NavigationActions.navigate({
          routeName: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE
        })
      );
    },
    startScreenName: BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE,
    complete: optInPaymentMethodsCompleted,
    back: optInPaymentMethodsBack,
    cancel: optInPaymentMethodsCancel,
    failure: optInPaymentMethodsFailure
  });
}

export function* optInPaymentMethodsHandler() {
  yield call(withFailureHandling, () =>
    withResetNavigationStack(optInPaymentMethodsWorkUnit)
  );
}

/**
 * This saga orchestrate the choice of the user to delete the payment methods added during the cashback.
 * This saga execute 2 actions:
 * - delete all the payment methods with the BPD capability
 * - store the user choice
 */

export function* optInDeletionChoiceHandler() {
  // Perform the payment methods deletion
  yield put(
    deleteAllPaymentMethodsByFunction.request(EnableableFunctionsEnum.BPD)
  );
  const deleteAllPaymentMethodsByFunctionStatus: ActionType<
    | typeof deleteAllPaymentMethodsByFunction.success
    | typeof deleteAllPaymentMethodsByFunction.failure
  > = yield take([
    getType(deleteAllPaymentMethodsByFunction.success),
    getType(deleteAllPaymentMethodsByFunction.failure)
  ]);

  if (
    isActionOf(
      deleteAllPaymentMethodsByFunction.failure,
      deleteAllPaymentMethodsByFunctionStatus
    )
  ) {
    return;
  }

  // If the payment methods deletion succeeded, perform the opt-in update
  yield put(bpdUpdateOptInStatusMethod.request(CitizenOptInStatusEnum.DENIED));
}
