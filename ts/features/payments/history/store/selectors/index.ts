import { GlobalState } from "../../../../../store/reducers/types";

export const selectPaymentsHistoryArchive = (state: GlobalState) =>
  state.features.payments.history.archive;

export const selectPaymentsOngoingFailed = (state: GlobalState) =>
  state.features.payments.history.paymentsOngoingFailed;

export const selectOngoingPaymentHistory = (state: GlobalState) =>
  state.features.payments.history.ongoingPayment;

export const paymentAnalyticsDataSelector = (state: GlobalState) =>
  state.features.payments.history.analyticsData;
