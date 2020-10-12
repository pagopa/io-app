import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import {
  bpdPaymentMethodActivation,
  bpdUpdatePaymentMethodActivation
} from "../../store/actions/paymentMethods";

/**
 * Placeholder method for remote call
 * Request the actual state of bpd on a payment method
 */
export function* bpdLoadPaymentMethodActivationSaga(
  action: ActionType<typeof bpdPaymentMethodActivation.request>
) {
  yield delay(125);
  yield put(
    bpdPaymentMethodActivation.success({
      hPan: action.payload,
      activationStatus: "active"
    })
  );
}

/**
 * Placeholder method for remote call
 * Change the activation state on a payment method
 */
export function* bpdUpdatePaymentMethodActivationSaga(
  action: ActionType<typeof bpdUpdatePaymentMethodActivation.request>
) {
  yield delay(125);
  yield put(
    bpdUpdatePaymentMethodActivation.success({
      hPan: action.payload.hPan,
      activationStatus: action.payload.value
    })
  );
}
