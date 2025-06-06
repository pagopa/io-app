import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { call, race, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { updatePaymentForMessage } from "../../../messages/store/actions";
import {
  cancelPNPaymentStatusTracking,
  startPNPaymentStatusTracking
} from "../actions";
import {
  maxVisiblePaymentCountGenerator,
  paymentsFromPNMessagePot
} from "../../utils";
import { UIMessageId } from "../../../messages/types";
import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { pnMessageFromIdSelector } from "../reducers";
import { Detail_v2Enum } from "../../../../../definitions/payments/PaymentProblemJson";
import {
  isPaidPaymentFromDetailV2Enum,
  isExpiredPaymentFromDetailV2Enum,
  isRevokedPaymentFromDetailV2Enum,
  isOngoingPaymentFromDetailV2Enum
} from "../../../../utils/payment";
import { TrackPNPaymentStatus, trackPNPaymentStatus } from "../../analytics";
import {
  foldPaymentStatus,
  payablePayment,
  PaymentStatus,
  processedPayment
} from "../../../messages/saga/handlePaymentStatusForAnalyticsTracking";

type PartialTrackPNPaymentStatus = Omit<TrackPNPaymentStatus, "paymentCount">;

export function* watchPaymentStatusForMixpanelTracking(
  action: ActionType<typeof startPNPaymentStatusTracking>
) {
  yield* race({
    polling: call(trackPaymentUpdates, action.payload.messageId),
    cancelAction: take(cancelPNPaymentStatusTracking)
  });
}

/**
 * This saga is used to track a mixpanel event which is a report of
 * PN payment updates. Is important to notice that the report is
 * computed only on the payments shown in the message details screen,
 * as to say, not for the payments that may appear later in the bottom sheet.
 *
 * The algorithm behind this is to enqueue the payments that are requested
 * by the screen (since they are requested sequentially upon screen loading).
 * As soon as they update is completed and there is a match with an enqueued
 * one, the update result is paired and saved with the enqueued payment.
 * If all enqueued payments have been updated, data is ready to produce
 * the statistics required by the tracking event and this saga is terminated.
 */
function* trackPaymentUpdates(messageId: UIMessageId) {
  const maxVisiblePaymentsInDetailsUI = maxVisiblePaymentCountGenerator();
  const paymentsToTrackMap = new Map<string, O.Option<PaymentStatus>>();
  while (true) {
    const updatePaymentForMessageAction = yield* take([
      updatePaymentForMessage.request,
      updatePaymentForMessage.success,
      updatePaymentForMessage.failure
    ]);
    if (
      isActionOf(updatePaymentForMessage.request, updatePaymentForMessageAction)
    ) {
      // Make sure not to enqueue more payments than the one shown by the UI.
      // This may happen if some payments get updated while others suffer from
      // some delay. In such case, the user may have the time to open the
      // bottom sheet (which cannot be opened until at least one payment update
      // is completed) and this code would be triggered but, since the first
      // UI payment were already requested, this guard prevent adding
      // un-observed payment to the map
      if (paymentsToTrackMap.size <= maxVisiblePaymentsInDetailsUI) {
        const paymentId = updatePaymentForMessageAction.payload.paymentId;
        paymentsToTrackMap.set(paymentId, O.none);
      }
    } else if (
      isActionOf(
        updatePaymentForMessage.success,
        updatePaymentForMessageAction
      ) ||
      isActionOf(updatePaymentForMessage.failure, updatePaymentForMessageAction)
    ) {
      const paymentId = updatePaymentForMessageAction.payload.paymentId;
      // This check is not really be necessary but it is here to strengthen the solution
      if (paymentsToTrackMap.has(paymentId)) {
        yield* call(
          addPaymentStatusToMap,
          paymentId,
          updatePaymentForMessageAction,
          paymentsToTrackMap
        );
        const trackedPaymentsArray = Array.from(paymentsToTrackMap.values());
        // We are done processing as soon as all payments have been updated.
        // We know we are not ready yet as soon as we find a payment that
        // does not have an update (O.none)
        const isDoneProcessing = !trackedPaymentsArray.some(
          maybeProcessedPayment => O.isNone(maybeProcessedPayment)
        );
        if (isDoneProcessing) {
          // All payments' update have been retrieved, compute, track and end
          yield* call(
            computeAndTrackPaymentStatuses,
            messageId,
            trackedPaymentsArray
          );
          return;
        }
      }
    }
  }
}

function addPaymentStatusToMap(
  paymentId: string,
  action:
    | ActionType<typeof updatePaymentForMessage.success>
    | ActionType<typeof updatePaymentForMessage.failure>,
  paymentsToTrack: Map<string, O.Option<PaymentStatus>>
) {
  if (isActionOf(updatePaymentForMessage.success, action)) {
    paymentsToTrack.set(paymentId, O.some(payablePayment));
  } else {
    const details = action.payload.details;
    paymentsToTrack.set(paymentId, O.some(processedPayment(details)));
  }
}

function* computeAndTrackPaymentStatuses(
  messageId: UIMessageId,
  paymentStatuses: ReadonlyArray<O.Option<PaymentStatus>>
) {
  const currentFiscalCode = yield* select(profileFiscalCodeSelector);
  const message = yield* select(state =>
    pnMessageFromIdSelector(state, messageId)
  );
  const payments = yield* call(
    paymentsFromPNMessagePot,
    currentFiscalCode,
    message
  );

  const paymentCount = payments?.length ?? 0;
  const partialPaymentStatistics: PartialTrackPNPaymentStatus =
    paymentStatuses.reduce(
      (accumulator, maybePaymentStatus) =>
        pipe(
          maybePaymentStatus,
          O.map(paymentStatus =>
            pipe(
              paymentStatus,
              foldPaymentStatus(
                () => ({
                  ...accumulator,
                  unpaidCount: accumulator.unpaidCount + 1
                }),
                details =>
                  computeProcessedPaymentStatistics(accumulator, details)
              )
            )
          ),
          O.getOrElse(() => accumulator)
        ),
      {
        unpaidCount: 0,
        paidCount: 0,
        errorCount: 0,
        expiredCount: 0,
        revokedCount: 0,
        ongoingCount: 0
      }
    );
  yield* call(trackPNPaymentStatus, {
    paymentCount,
    ...partialPaymentStatistics
  });
}

const computeProcessedPaymentStatistics = (
  accumulator: PartialTrackPNPaymentStatus,
  details: Detail_v2Enum
): PartialTrackPNPaymentStatus =>
  isPaidPaymentFromDetailV2Enum(details)
    ? {
        ...accumulator,
        paidCount: accumulator.paidCount + 1
      }
    : isExpiredPaymentFromDetailV2Enum(details)
    ? {
        ...accumulator,
        expiredCount: accumulator.expiredCount + 1
      }
    : isRevokedPaymentFromDetailV2Enum(details)
    ? {
        ...accumulator,
        revokedCount: accumulator.revokedCount + 1
      }
    : isOngoingPaymentFromDetailV2Enum(details)
    ? {
        ...accumulator,
        ongoingCount: accumulator.ongoingCount + 1
      }
    : {
        ...accumulator,
        errorCount: accumulator.errorCount + 1
      };
