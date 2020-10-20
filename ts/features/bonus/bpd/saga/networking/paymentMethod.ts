import { call, delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";
import {
  bpdPaymentMethodActivation,
  bpdUpdatePaymentMethodActivation
} from "../../store/actions/paymentMethods";
import { SagaCallReturnType } from "../../../../../types/utils";
import { BackendBpdClient } from "../../api/backendBpdClient";

/**
 * Request the actual state of bpd on a payment method
 */
export function* bpdLoadPaymentMethodActivationSaga(
  findPaymentMethod: ReturnType<typeof BackendBpdClient>["findPayment"],
  action: ActionType<typeof bpdPaymentMethodActivation.request>
) {
  try {
    const findPaymentMethodResult: SagaCallReturnType<typeof findPaymentMethod> = yield call(
      findPaymentMethod,
      { id: action.payload } as any
    );
    if (findPaymentMethodResult.isRight()) {
      if (findPaymentMethodResult.value.status === 200) {
        yield put(
          bpdPaymentMethodActivation.success(
            findPaymentMethodResult.value.value
          )
        );
        return;
      }
      throw new Error(
        `response status ${findPaymentMethodResult.value.status}`
      );
    } else {
      throw new Error(readableReport(findPaymentMethodResult.value));
    }
  } catch (e) {
    const error = typeof e === "string" ? Error(e) : e;
    yield put(
      bpdPaymentMethodActivation.failure({ hPan: action.payload, error })
    );
  }
}

/**
 * TODO: Placeholder method for remote call
 * Change the activation state on a payment method
 */
export function* bpdUpdatePaymentMethodActivationSaga(
  action: ActionType<typeof bpdUpdatePaymentMethodActivation.request>
) {
  yield delay(5000);
  // yield put(
  //   bpdUpdatePaymentMethodActivation.success({
  //     hPan: action.payload.hPan,
  //     activationStatus: action.payload.value ? "active" : "inactive"
  //   })
  // );
  yield put(
    bpdUpdatePaymentMethodActivation.failure({
      hPan: action.payload.hPan,
      error: new Error("asd")
    })
  );
}
