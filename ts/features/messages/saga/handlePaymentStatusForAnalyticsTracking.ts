import { call, race, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import {
  cancelPaymentStatusTracking,
  startPaymentStatusTracking,
  updatePaymentForMessage
} from "../store/actions";
import { serviceDetailsByIdSelector } from "../../services/details/store/selectors";
import {
  isExpiredPaymentFromDetailV2Enum,
  isOngoingPaymentFromDetailV2Enum,
  isPaidPaymentFromDetailV2Enum,
  isRevokedPaymentFromDetailV2Enum
} from "../../../utils/payment";
import { trackPaymentStatus } from "../analytics";
import { isTestEnv } from "../../../utils/environment";
import { isMessagePaymentSpecificError } from "../types/paymentErrors";

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
    const messagePaymentUpdateResult = yield* take([
      updatePaymentForMessage.success,
      updatePaymentForMessage.failure
    ]);

    const serviceId = messagePaymentUpdateResult.payload.serviceId;
    const service = yield* select(serviceDetailsByIdSelector, serviceId);
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
    const failureReason = action.payload.reason;
    if (isMessagePaymentSpecificError(failureReason)) {
      const details = failureReason.details;
      if (isExpiredPaymentFromDetailV2Enum(details)) {
        return "expired";
      } else if (isRevokedPaymentFromDetailV2Enum(details)) {
        return "revoked";
      } else if (isPaidPaymentFromDetailV2Enum(details)) {
        return "paid";
      } else if (isOngoingPaymentFromDetailV2Enum(details)) {
        return "inprogress";
      }
    }
    return "error";
  }
  return "unpaid";
};

export const testable = isTestEnv ? { trackPaymentUpdates } : undefined;
