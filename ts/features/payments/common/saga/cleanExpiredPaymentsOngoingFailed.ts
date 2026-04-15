import { SagaIterator } from "redux-saga";
import { select, put } from "typed-redux-saga/macro";
import { removeExpiredPaymentsOngoingFailedAction } from "../../history/store/actions";
import { selectPaymentsOngoingFailed } from "../../history/store/selectors";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";

const PAYMENT_ONGOING_RPTID_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Clean expired payments ongoing failed from the store considering the
 * PAYMENT_ONGOING_RPTID_TTL_MS time-to-live
 */
export function* cleanExpiredPaymentsOngoingFailed(): SagaIterator {
  const paymentsOngoingFailed = yield* select(selectPaymentsOngoingFailed);

  if (paymentsOngoingFailed) {
    const nowWall = Date.now();
    const nowPerf = performance.now();
    const MAX_ALLOWED_DRIFT = 60000;

    const expiredRptIds = Object.entries(paymentsOngoingFailed)
      .filter(([_, failure]) => {
        if (!failure) {
          return false;
        }

        const deltaWall = nowWall - failure.wallClock;
        const deltaPerf = nowPerf - failure.appClock;
        const discrepancy = Math.abs(deltaWall - deltaPerf);

        const effectiveElapsed =
          discrepancy > MAX_ALLOWED_DRIFT ? deltaPerf : deltaWall;

        return effectiveElapsed >= PAYMENT_ONGOING_RPTID_TTL_MS;
      })
      .map(([rptId]) => rptId as RptId);

    if (expiredRptIds.length > 0) {
      yield* put(removeExpiredPaymentsOngoingFailedAction(expiredRptIds));
    }
  }
}
