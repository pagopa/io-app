import { put, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { paymentsLastDeletedSet } from "../store/actions/payments";
import {
  paymentDeletePayment,
  paymentInitializeState
} from "../store/actions/wallet/payment";
import { paymentsCurrentStateSelector } from "../store/reducers/payments/current";

/**
 * Detect an uncompleted payment and send the delete to the PaymentManager.
 */
export function* paymentsDeleteUncompletedSaga() {
  const paymentsCurrentState: ReturnType<typeof paymentsCurrentStateSelector> =
    yield* select(paymentsCurrentStateSelector);

  if (paymentsCurrentState.kind === "ACTIVATED") {
    const { rptId } = paymentsCurrentState.initializationData;
    const { idPayment } = paymentsCurrentState.activationData;

    yield* put(paymentDeletePayment.request({ paymentId: idPayment }));

    const resultAction = yield* take<
      ActionType<
        | typeof paymentDeletePayment.success
        | typeof paymentDeletePayment.failure
      >
    >([paymentDeletePayment.success, paymentDeletePayment.failure]);

    if (isActionOf(paymentDeletePayment.success, resultAction)) {
      yield* put(
        paymentsLastDeletedSet({
          at: Date.now(),
          rptId,
          idPayment
        })
      );
    }

    // Reinitialize the state of the Payment
    yield* put(paymentInitializeState());
  }
}
