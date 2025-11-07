import { call, delay, race, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  cancelPNPaymentStatusTracking,
  startPNPaymentStatusTracking
} from "../actions";
import { maxVisiblePaymentCount, paymentsFromPNMessagePot } from "../../utils";
import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { pnMessageFromIdSelector } from "../reducers";
import { trackPNPaymentStatus } from "../../analytics";
import { getRptIdStringFromPayment } from "../../utils/rptId";
import { paymentStatisticsForMessageUncachedSelector } from "../../../messages/store/reducers/payments";
import { isTestEnv } from "../../../../utils/environment";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";

/**
 * This saga is used to track a mixpanel event which is a report of
 * PN payment updates. Is important to notice that the report is
 * computed only on the payments shown in the message details screen,
 * as to say, not for the payments that may appear later in the bottom sheet.
 */
export function* watchPaymentStatusForMixpanelTracking(
  action: ActionType<typeof startPNPaymentStatusTracking>
) {
  const { openingSource, userType, messageId } = action.payload;
  const currentFiscalCode = yield* select(profileFiscalCodeSelector);
  const message = yield* select(pnMessageFromIdSelector, messageId);

  const fiscalCodeOrUndefined =
    openingSource === "message" ? currentFiscalCode : undefined;
  const payments = yield* call(
    paymentsFromPNMessagePot,
    fiscalCodeOrUndefined,
    message
  );
  const visibleRPTIds =
    payments
      ?.slice(0, maxVisiblePaymentCount)
      .map(payment => getRptIdStringFromPayment(payment)) ?? [];
  const paymentCount = payments?.length ?? 0;

  yield* race({
    polling: call(
      generateSENDMessagePaymentStatistics,
      openingSource,
      userType,
      messageId,
      paymentCount,
      visibleRPTIds
    ),
    cancelAction: take(cancelPNPaymentStatusTracking)
  });
}

function* generateSENDMessagePaymentStatistics(
  openingSource: SendOpeningSource,
  userType: SendUserType,
  messageId: string,
  paymentCount: number,
  paymentsRpdIds: ReadonlyArray<string>
) {
  if (paymentCount === 0 || paymentsRpdIds.length === 0) {
    // Nothing to track
    return;
  }
  while (true) {
    const paymentStatistics = yield* select(
      paymentStatisticsForMessageUncachedSelector,
      messageId,
      paymentCount,
      paymentsRpdIds
    );
    if (paymentStatistics == null) {
      // Some payments are still being processed, wait a bit
      yield* delay(500);
    } else {
      // Payment statistics are ready, track them
      yield* call(
        trackPNPaymentStatus,
        paymentStatistics,
        openingSource,
        userType
      );
      // Exit the loop and end the saga
      return;
    }
  }
}

export const testable = isTestEnv
  ? { generateSENDMessagePaymentStatistics }
  : undefined;
