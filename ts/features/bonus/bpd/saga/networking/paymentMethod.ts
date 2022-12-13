import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
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
  activationStatus: pipe(
    mapStatus.get(networkPayload.Status),
    O.fromNullable,
    O.getOrElseW(() => "notActivable" as const)
  ),
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
    > = yield* call(findPaymentMethod, { id: action.payload } as any);
    if (E.isRight(findPaymentMethodResult)) {
      if (findPaymentMethodResult.right.status === 200) {
        yield* put(
          bpdPaymentMethodActivation.success(
            convertNetworkPayload(findPaymentMethodResult.right.value)
          )
        );
        return;
      } else if (findPaymentMethodResult.right.status === 409) {
        // conflict means not activable
        yield* put(
          bpdPaymentMethodActivation.success(whenConflict(action.payload))
        );
        return;
      } else if (findPaymentMethodResult.right.status === 404) {
        yield* put(
          bpdPaymentMethodActivation.success({
            hPan: action.payload,
            activationStatus: "inactive"
          })
        );
        return;
      }
      throw new Error(
        `response status ${findPaymentMethodResult.right.status}`
      );
    } else {
      throw new Error(readableReport(findPaymentMethodResult.left));
    }
  } catch (e) {
    yield* put(
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
    yield* call(enrollPaymentMethod, enrollPayment, action);
  } else {
    yield* call(deletePaymentMethod, deletePayment, action);
  }
}

function* enrollPaymentMethod(
  enrollPaymentMethod: ReturnType<typeof BackendBpdClient>["enrollPayment"],
  action: ActionType<typeof bpdUpdatePaymentMethodActivation.request>
) {
  try {
    const enrollPaymentMethodResult: SagaCallReturnType<
      typeof enrollPaymentMethod
    > = yield* call(enrollPaymentMethod, { id: action.payload.hPan } as any);
    if (E.isRight(enrollPaymentMethodResult)) {
      if (enrollPaymentMethodResult.right.status === 200) {
        const responsePayload = enrollPaymentMethodResult.right.value;
        yield* put(
          bpdUpdatePaymentMethodActivation.success({
            hPan: action.payload.hPan,
            activationDate: responsePayload.activationDate,
            activationStatus: getPaymentStatus(action.payload.value)
          })
        );
        return;
      } else if (enrollPaymentMethodResult.right.status === 409) {
        yield* put(
          bpdUpdatePaymentMethodActivation.success(
            whenConflict(action.payload.hPan)
          )
        );
        return;
      }
      throw new Error(
        `response status ${enrollPaymentMethodResult.right.status}`
      );
    } else {
      throw new Error(readableReport(enrollPaymentMethodResult.left));
    }
  } catch (e) {
    yield* put(
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
    > = yield* call(deletePaymentMethod, { id: action.payload.hPan } as any);
    if (E.isRight(deletePaymentMethodResult)) {
      if (deletePaymentMethodResult.right.status === 204) {
        yield* put(
          bpdUpdatePaymentMethodActivation.success({
            hPan: action.payload.hPan,
            activationStatus: getPaymentStatus(action.payload.value)
          })
        );
        return;
      }
      throw new Error(
        `response status ${deletePaymentMethodResult.right.status}`
      );
    } else {
      throw new Error(readableReport(deletePaymentMethodResult.left));
    }
  } catch (e) {
    yield* put(
      bpdUpdatePaymentMethodActivation.failure({
        hPan: action.payload.hPan,
        error: getError(e)
      })
    );
  }
}
