import { put, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { deleteAllPaymentMethodsByFunction } from "../../../../../../store/actions/wallet/delete";
import { EnableableFunctionsEnum } from "../../../../../../../definitions/pagopa/EnableableFunctions";
import { bpdUpdateOptInStatusMethod } from "../../../store/actions/onboarding";
import { CitizenOptInStatusEnum } from "../../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";
import { ReduxSagaEffect } from "../../../../../../types/utils";

/**
 * This saga orchestrate the choice of the user to delete the payment methods added during the cashback.
 * This saga execute 2 actions:
 * - delete all the payment methods with the BPD capability
 * - store the user choice
 */

export function* optInDeletionChoiceHandler(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
  // Perform the payment methods deletion
  yield* put(
    deleteAllPaymentMethodsByFunction.request(EnableableFunctionsEnum.BPD)
  );
  const deleteAllPaymentMethodsByFunctionStatus = yield* take<
    ActionType<
      | typeof deleteAllPaymentMethodsByFunction.success
      | typeof deleteAllPaymentMethodsByFunction.failure
    >
  >([
    deleteAllPaymentMethodsByFunction.success,
    deleteAllPaymentMethodsByFunction.failure
  ]);
  if (
    isActionOf(
      deleteAllPaymentMethodsByFunction.success,
      deleteAllPaymentMethodsByFunctionStatus
    )
  ) {
    // If the payment methods deletion succeeded, perform the opt-in update
    yield* put(
      bpdUpdateOptInStatusMethod.request(CitizenOptInStatusEnum.DENIED)
    );
  }
}
