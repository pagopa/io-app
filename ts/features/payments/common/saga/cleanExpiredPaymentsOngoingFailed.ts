import { SagaIterator } from "redux-saga";
import { select, put } from "typed-redux-saga/macro";
import { removeExpiredPaymentsOngoingFailedAction } from "../../history/store/actions";
import { selectPaymentsOngoingFailed } from "../../history/store/selectors";
import { PAYMENT_ONGOING_FAILURE_WAIT_TIME } from "../../checkout/components/WalletPaymentFailureDetail";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";

/**
 * Clean expired payments ongoing failed from the store considering the
 * PAYMENT_ONGOING_FAILURE_WAIT_TIME time-to-live
 */
export function* cleanExpiredPaymentsOngoingFailed(): SagaIterator {
  const paymentsOngoingFailed = yield* select(selectPaymentsOngoingFailed);

  if (paymentsOngoingFailed) {
    const now = new Date().getTime();
    const expiredRptIds = Object.entries(paymentsOngoingFailed)
      .filter(
        ([_, failureDate]) =>
          failureDate &&
          now - new Date(failureDate).getTime() >=
            PAYMENT_ONGOING_FAILURE_WAIT_TIME
      )
      .map(([rptId]) => rptId as RptId);

    if (expiredRptIds.length > 0) {
      yield* put(removeExpiredPaymentsOngoingFailedAction(expiredRptIds));
    }
  }
}
