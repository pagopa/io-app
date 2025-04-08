import { call, race, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import {
  cancelPaymentStatusTracking,
  startPaymentStatusTracking,
  updatePaymentForMessage
} from "../store/actions";
import { serviceByIdSelector } from "../../services/details/store/reducers";
import { Detail_v2Enum } from "../../../../definitions/backend/PaymentProblemJson";
import {
  isExpiredPaymentFromDetailV2Enum,
  isOngoingPaymentFromDetailV2Enum,
  isPaidPaymentFromDetailV2Enum,
  isRevokedPaymentFromDetailV2Enum
} from "../../../utils/payment";
import { trackPaymentStatus } from "../analytics";

type PayablePayment = {
  kind: "Payable";
};
type ProcessedPayment = {
  kind: "Processed";
  details: Detail_v2Enum;
};
export type PaymentStatus = PayablePayment | ProcessedPayment;

export const payablePayment: PayablePayment = {
  kind: "Payable"
};
export const processedPayment = (details: Detail_v2Enum): ProcessedPayment => ({
  kind: "Processed",
  details
});

export const foldPaymentStatus =
  <T>(payable: () => T, processed: (details: Detail_v2Enum) => T) =>
  (input: PaymentStatus) =>
    input.kind === "Payable" ? payable() : processed(input.details);

export function* handlePaymentStatusForAnalyticsTracking(
  _: ActionType<typeof startPaymentStatusTracking>
) {
  yield* race({
    polling: call(trackPaymentUpdates),
    cancelAction: take(cancelPaymentStatusTracking)
  });
}

function* trackPaymentUpdates() {
  do {
    const messagePaymentUpdateResult: ActionType<
      | typeof updatePaymentForMessage.success
      | typeof updatePaymentForMessage.failure
    > = yield* take([
      updatePaymentForMessage.success,
      updatePaymentForMessage.failure
    ]);

    const serviceId = messagePaymentUpdateResult.payload.serviceId;
    const service = yield* select(serviceByIdSelector, serviceId);
    const organizationName = service?.organization.name;
    const organizationFiscalCode = service?.organization.fiscal_code;
    const serviceName = service?.name;
    const paymentStatus = paymentStatusFromPaymentUpdateResult(
      messagePaymentUpdateResult
    );

    yield* call(
      trackPaymentStatus,
      serviceId,
      serviceName,
      organizationName,
      organizationFiscalCode,
      paymentStatus
    );
  } while (true);
}

export const paymentStatusFromPaymentUpdateResult = (
  action: ActionType<
    | typeof updatePaymentForMessage.success
    | typeof updatePaymentForMessage.failure
  >
) => {
  if (isActionOf(updatePaymentForMessage.failure, action)) {
    const failureReason = action.payload.details;
    if (isExpiredPaymentFromDetailV2Enum(failureReason)) {
      return "expired";
    } else if (isRevokedPaymentFromDetailV2Enum(failureReason)) {
      return "revoked";
    } else if (isPaidPaymentFromDetailV2Enum(failureReason)) {
      return "paid";
    } else if (isOngoingPaymentFromDetailV2Enum(failureReason)) {
      return "inprogress";
    }
    return "error";
  }
  return "unpaid";
};
