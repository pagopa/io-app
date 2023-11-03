import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import { call, race, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import {
  cancelPaymentStatusTracking,
  startPaymentStatusTracking,
  updatePaymentForMessage
} from "../actions";
import {
  maxVisiblePaymentCountGenerator,
  paymentsFromPNMessagePot
} from "../../utils";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { profileFiscalCodeSelector } from "../../../../store/reducers/profile";
import { pnMessageFromIdSelector } from "../reducers";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import {
  isPaidPaymentFromDetailV2Enum,
  isExpiredPaymentFromDetailV2Enum,
  isRevokedPaymentFromDetailV2Enum,
  isOngoingPaymentFromDetailV2Enum
} from "../../../../utils/payment";
import { trackPNPaymentStatus } from "../../analytics";

type PayablePayment = {
  kind: "Payable";
};
type ProcessedPayment = {
  kind: "Processed";
  details: Detail_v2Enum;
};
type PaymentStatus = PayablePayment | ProcessedPayment;

const payablePayment: PayablePayment = {
  kind: "Payable"
};
const processedPayment = (details: Detail_v2Enum): ProcessedPayment => ({
  kind: "Processed",
  details
});

export function* watchPaymentStatusForMixpanelTracking(
  action: ActionType<typeof startPaymentStatusTracking>
) {
  yield* race({
    polling: call(trackPaymentUpdates, action.payload.messageId),
    cancelAction: take(cancelPaymentStatusTracking)
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
  const unpaidCount = paymentStatuses.reduce(
    (accumulator, paymentStatus) =>
      accumulator + paymentStatusToZeroOrOne(paymentStatus),
    0
  );
  const paidCount = paymentStatuses.reduce(
    (accumulator, paymentStatus) =>
      accumulator +
      paymentStatusToZeroOrOne(
        paymentStatus,
        O.some(isPaidPaymentFromDetailV2Enum)
      ),
    0
  );
  const errorCount = paymentStatuses.reduce(
    (accumulator, paymentStatus) =>
      accumulator +
      paymentStatusToZeroOrOne(
        paymentStatus,
        O.some(isErrorPaymentFromDetailV2Enum)
      ),
    0
  );
  const expiredCount = paymentStatuses.reduce(
    (accumulator, paymentStatus) =>
      accumulator +
      paymentStatusToZeroOrOne(
        paymentStatus,
        O.some(isExpiredPaymentFromDetailV2Enum)
      ),
    0
  );
  const revokedCount = paymentStatuses.reduce(
    (accumulator, paymentStatus) =>
      accumulator +
      paymentStatusToZeroOrOne(
        paymentStatus,
        O.some(isRevokedPaymentFromDetailV2Enum)
      ),
    0
  );
  const ongoingCount = paymentStatuses.reduce(
    (accumulator, paymentStatus) =>
      accumulator +
      paymentStatusToZeroOrOne(
        paymentStatus,
        O.some(isOngoingPaymentFromDetailV2Enum)
      ),
    0
  );
  yield* call(trackPNPaymentStatus, {
    paymentCount,
    unpaidCount,
    paidCount,
    errorCount,
    expiredCount,
    revokedCount,
    ongoingCount
  });
}

/**
 * This function is used in a reducer in order to compute how many payments are of a specific type.
 *
 * If you want to know how many payments are payable, do not provide a `maybeDetailsFunction`.
 * If you want to know how many payments have a specific error, provide a `maybeDetailsFunction` that
 * matches the payment error code(s) you are interest about
 */
const paymentStatusToZeroOrOne = (
  maybePaymentStatus: O.Option<PaymentStatus>,
  maybeDetailsFunction: O.Option<(details: Detail_v2Enum) => boolean> = O.none
) =>
  pipe(
    maybePaymentStatus,
    O.fold(
      () => 0, // No payment status
      paymentStatus =>
        pipe(
          paymentStatus,
          foldPaymentStatus(
            () =>
              // This is a payable payment
              pipe(
                maybeDetailsFunction,
                O.fold(
                  () => 1, // Function has been called to know if the payment is payable, and it is
                  _ => 0 // Function has been called to know if the payment has an error but it does not (since it is payable)
                )
              ),
            (
              details // This is a payment with an error
            ) =>
              pipe(
                maybeDetailsFunction,
                O.fold(
                  () => 0, // Function has been called to know if the payment is payable but it does not (since it has an error)
                  matchingDetailsFunction =>
                    pipe(
                      details,
                      matchingDetailsFunction,
                      B.fold(
                        () => 0, // Function has been called to check a specific payment error, but it did not match
                        () => 1 // Function has been called to check a specific payment error and it matched
                      )
                    )
                )
              )
          )
        )
    )
  );

const foldPaymentStatus =
  (payable: () => number, processed: (details: Detail_v2Enum) => number) =>
  (input: PaymentStatus) =>
    input.kind === "Payable" ? payable() : processed(input.details);

/**
 * A payment is considered to have a generic error when it does not match any of the other error ones
 */
const isErrorPaymentFromDetailV2Enum = (details: Detail_v2Enum) =>
  !isPaidPaymentFromDetailV2Enum(details) &&
  !isExpiredPaymentFromDetailV2Enum(details) &&
  !isRevokedPaymentFromDetailV2Enum(details) &&
  !isOngoingPaymentFromDetailV2Enum(details);
