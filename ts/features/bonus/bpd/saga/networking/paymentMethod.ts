import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { fromNullable } from "fp-ts/lib/Option";
import {
  BpdPaymentMethodActivation,
  bpdPaymentMethodActivation,
  BpdPmActivationStatus,
  bpdUpdatePaymentMethodActivation,
  HPan
} from "../../store/actions/paymentMethods";
import { SagaCallReturnType } from "../../../../../types/utils";
import { BackendBpdClient } from "../../api/backendBpdClient";
import { getError } from "../../../../../utils/errors";
import {
  PaymentInstrumentResource,
  StatusEnum
} from "../../../../../../definitions/bpd/payment/PaymentInstrumentResource";
import { getPaymentStatus } from "../../store/reducers/details/paymentMethods";

const mapStatus: Map<StatusEnum, BpdPmActivationStatus> = new Map<
  StatusEnum,
  BpdPmActivationStatus
>([
  [StatusEnum.ACTIVE, "active"],
  [StatusEnum.INACTIVE, "inactive"]
]);

// convert the network payload to the logical app representation of it
const convertNetworkPayload = (
  networkPayload: PaymentInstrumentResource
): BpdPaymentMethodActivation => ({
  hPan: networkPayload.hpan as HPan,
  activationStatus: fromNullable(
    mapStatus.get(networkPayload.Status)
  ).getOrElse("notActivable"),
  activationDate: networkPayload.activationDate,
  deactivationDate: networkPayload.deactivationDate
});

/**
 * return {@link BpdPaymentMethodActivation} when network response is conflict (409)
 */
const whenConflict = (hPan: HPan): BpdPaymentMethodActivation => ({
  hPan,
  activationStatus: "notActivable"
});

/**
 * Request the actual state of bpd on a payment method
 */
export function* bpdLoadPaymentMethodActivationSaga(
  findPaymentMethod: ReturnType<typeof BackendBpdClient>["findPayment"],
  action: ActionType<typeof bpdPaymentMethodActivation.request>
) {
  try {
    const findPaymentMethodResult: SagaCallReturnType<
      typeof findPaymentMethod
    > = yield call(findPaymentMethod, { id: action.payload } as any);
    if (findPaymentMethodResult.isRight()) {
      if (findPaymentMethodResult.value.status === 200) {
        yield put(
          bpdPaymentMethodActivation.success(
            convertNetworkPayload(findPaymentMethodResult.value.value)
          )
        );
        return;
      } else if (findPaymentMethodResult.value.status === 409) {
        // conflict means not activable
        yield put(
          bpdPaymentMethodActivation.success(whenConflict(action.payload))
        );
        return;
      } else if (findPaymentMethodResult.value.status === 404) {
        yield put(
          bpdPaymentMethodActivation.success({
            hPan: action.payload,
            activationStatus: "inactive"
          })
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
    yield put(
      bpdPaymentMethodActivation.failure({
        hPan: action.payload,
        error: getError(e)
      })
    );
  }
}

/**
 * Change the activation state on a payment method
 * action.payload.value: if true it enrolls the method otherwise it deletes it
 */
export function* bpdUpdatePaymentMethodActivationSaga(
  enrollPayment: ReturnType<typeof BackendBpdClient>["enrollPayment"],
  deletePayment: ReturnType<typeof BackendBpdClient>["deletePayment"],
  action: ActionType<typeof bpdUpdatePaymentMethodActivation.request>
) {
  if (action.payload.value) {
    yield call(enrollPaymentMethod, enrollPayment, action);
  } else {
    yield call(deletePaymentMethod, deletePayment, action);
  }
}

function* enrollPaymentMethod(
  enrollPaymentMethod: ReturnType<typeof BackendBpdClient>["enrollPayment"],
  action: ActionType<typeof bpdUpdatePaymentMethodActivation.request>
) {
  try {
    const enrollPaymentMethodResult: SagaCallReturnType<
      typeof enrollPaymentMethod
    > = yield call(enrollPaymentMethod, { id: action.payload.hPan } as any);
    if (enrollPaymentMethodResult.isRight()) {
      if (enrollPaymentMethodResult.value.status === 200) {
        const responsePayload = enrollPaymentMethodResult.value.value;
        yield put(
          bpdUpdatePaymentMethodActivation.success({
            hPan: action.payload.hPan,
            activationDate: responsePayload.activationDate,
            activationStatus: getPaymentStatus(action.payload.value)
          })
        );
        return;
      } else if (enrollPaymentMethodResult.value.status === 409) {
        yield put(
          bpdUpdatePaymentMethodActivation.success(
            whenConflict(action.payload.hPan)
          )
        );
        return;
      }
      throw new Error(
        `response status ${enrollPaymentMethodResult.value.status}`
      );
    } else {
      throw new Error(readableReport(enrollPaymentMethodResult.value));
    }
  } catch (e) {
    yield put(
      bpdUpdatePaymentMethodActivation.failure({
        hPan: action.payload.hPan,
        error: getError(e)
      })
    );
  }
}

function* deletePaymentMethod(
  deletePaymentMethod: ReturnType<typeof BackendBpdClient>["deletePayment"],
  action: ActionType<typeof bpdUpdatePaymentMethodActivation.request>
) {
  try {
    const deletePaymentMethodResult: SagaCallReturnType<
      typeof deletePaymentMethod
    > = yield call(deletePaymentMethod, { id: action.payload.hPan } as any);
    if (deletePaymentMethodResult.isRight()) {
      if (deletePaymentMethodResult.value.status === 204) {
        yield put(
          bpdUpdatePaymentMethodActivation.success({
            hPan: action.payload.hPan,
            activationStatus: getPaymentStatus(action.payload.value)
          })
        );
        return;
      }
      throw new Error(
        `response status ${deletePaymentMethodResult.value.status}`
      );
    } else {
      throw new Error(readableReport(deletePaymentMethodResult.value));
    }
  } catch (e) {
    yield put(
      bpdUpdatePaymentMethodActivation.failure({
        hPan: action.payload.hPan,
        error: getError(e)
      })
    );
  }
}
