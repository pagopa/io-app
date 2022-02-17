import { Effect, put, take } from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";
import { deleteAllPaymentMethodsByFunction } from "../../../../../../store/actions/wallet/delete";
import { EnableableFunctionsEnum } from "../../../../../../../definitions/pagopa/EnableableFunctions";
import { bpdUpdateOptInStatusMethod } from "../../../store/actions/onboarding";
import { CitizenOptInStatusEnum } from "../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";

/**
 * This saga orchestrate the choice of the user to delete the payment methods added during the cashback.
 * This saga execute 2 actions:
 * - delete all the payment methods with the BPD capability
 * - store the user choice
 */

export function* optInDeletionChoiceHandler(): Generator<Effect, void, any> {
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
      deleteAllPaymentMethodsByFunction.success,
      deleteAllPaymentMethodsByFunctionStatus
    )
  ) {
    // If the payment methods deletion succeeded, perform the opt-in update
    yield put(
      bpdUpdateOptInStatusMethod.request(CitizenOptInStatusEnum.DENIED)
    );
  }
}
