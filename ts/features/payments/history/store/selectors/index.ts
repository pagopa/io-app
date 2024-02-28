import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { GlobalState } from "../../../../../store/reducers/types";

export const selectWalletPaymentHistoryArchive = (state: GlobalState) =>
  state.features.payments.history.archive;

export const selectWalletOngoingPaymentHistory = (state: GlobalState) =>
  state.features.payments.history.ongoingPayment;

export const walletPaymentAttemptByRptSelector = (rptId: RptId) =>
  createSelector(selectWalletPaymentHistoryArchive, archive =>
    pipe(
      O.fromNullable(archive.find(h => h.rptId === rptId)),
      O.chainNullableK(h => h.attempt),
      O.getOrElse(() => 0)
    )
  );

export const walletOngoingPaymentAttemptSelector = createSelector(
  selectWalletOngoingPaymentHistory,
  paymentHistory =>
    pipe(
      O.fromNullable(paymentHistory),
      O.chainNullableK(h => h.attempt),
      O.getOrElse(() => 0)
    )
);
