import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { GlobalState } from "../../../../../store/reducers/types";

export const selectPaymentsHistoryArchive = (state: GlobalState) =>
  state.features.payments.history.archive;

export const selectPaymentsOngoingFailed = (state: GlobalState) =>
  state.features.payments.history.paymentsOngoingFailed;

export const selectOngoingPaymentHistory = (state: GlobalState) =>
  state.features.payments.history.ongoingPayment;

export const paymentAnalyticsDataSelector = (state: GlobalState) =>
  state.features.payments.history.analyticsData;

export const selectPaymentAttemptByRptId = (rptId: RptId) =>
  createSelector(selectPaymentsHistoryArchive, archive =>
    pipe(
      O.fromNullable(archive.find(h => h.rptId === rptId)),
      O.chainNullableK(h => h.attempt),
      O.getOrElse(() => 0)
    )
  );

export const selectOngoingPaymentAttempt = createSelector(
  selectOngoingPaymentHistory,
  paymentHistory =>
    pipe(
      O.fromNullable(paymentHistory),
      O.chainNullableK(h => h.attempt),
      O.getOrElse(() => 0)
    )
);
