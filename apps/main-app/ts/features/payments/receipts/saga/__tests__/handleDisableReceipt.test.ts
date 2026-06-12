import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { NoticeListWrapResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeListWrapResponse";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { paymentAnalyticsDataSelector } from "../../../history/store/selectors";
import {
  getPaymentsLatestReceiptAction,
  hidePaymentsReceiptAction,
  setNeedsHomeListRefreshAction
} from "../../store/actions";
import {
  latestTransactionsContinuationTokenSelector,
  walletLatestReceiptListPotSelector
} from "../../store/selectors";
import { handleDisableReceipt } from "../handleDisableReceipt";

describe("handleDisableReceipt", () => {
  const T_SESSION_TOKEN = "ABCD";
  const T_TRANSACTION_ID = "event123";

  const requestPayload = {
    transactionId: T_TRANSACTION_ID,
    trigger: "swipe" as const
  };

  const mockDisablePaidNotice = jest.fn();

  const mockPaymentAnalyticsData = {
    receiptOrganizationName: "Test Org",
    receiptFirstTimeOpening: false,
    receiptUser: "payer",
    receiptOrganizationFiscalCode: "12345678901"
  };

  const mockResponse: NoticeListWrapResponse = {
    notices: []
  };

  const mockNotices = [
    {
      eventId: "event1",
      payeeName: "Test Payee",
      payeeTaxCode: "12345678901",
      amount: 1000,
      noticeCode: "123456789012345678",
      isCart: false,
      isDebtor: false,
      isPayer: true,
      transactionDate: new Date().toISOString()
    }
  ];

  const mockContinuationToken = "token123";

  it(`should put ${getType(
    hidePaymentsReceiptAction.success
  )} and refresh list when response is 200 with remaining transactions and continuation token`, () => {
    testSaga(
      handleDisableReceipt,
      mockDisablePaidNotice,
      hidePaymentsReceiptAction.request(requestPayload)
    )
      .next()
      .select(paymentAnalyticsDataSelector)
      .next(mockPaymentAnalyticsData)
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: mockResponse }))
      .put(hidePaymentsReceiptAction.success(mockResponse))
      .next()
      .select(walletLatestReceiptListPotSelector)
      .next(pot.some(mockNotices))
      .select(latestTransactionsContinuationTokenSelector)
      .next(mockContinuationToken)
      .put(setNeedsHomeListRefreshAction(true))
      .next()
      .put(getPaymentsLatestReceiptAction.request())
      .next()
      .isDone();
  });

  it(`should put ${getType(
    hidePaymentsReceiptAction.success
  )} without refreshing list when there is no continuation token`, () => {
    testSaga(
      handleDisableReceipt,
      mockDisablePaidNotice,
      hidePaymentsReceiptAction.request(requestPayload)
    )
      .next()
      .select(paymentAnalyticsDataSelector)
      .next(mockPaymentAnalyticsData)
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: mockResponse }))
      .put(hidePaymentsReceiptAction.success(mockResponse))
      .next()
      .select(walletLatestReceiptListPotSelector)
      .next(pot.some(mockNotices))
      .select(latestTransactionsContinuationTokenSelector)
      .next(undefined)
      .next()
      .isDone();
  });

  it(`should put ${getType(
    hidePaymentsReceiptAction.success
  )} without refreshing list when there are no remaining transactions`, () => {
    testSaga(
      handleDisableReceipt,
      mockDisablePaidNotice,
      hidePaymentsReceiptAction.request(requestPayload)
    )
      .next()
      .select(paymentAnalyticsDataSelector)
      .next(mockPaymentAnalyticsData)
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: mockResponse }))
      .put(hidePaymentsReceiptAction.success(mockResponse))
      .next()
      .select(walletLatestReceiptListPotSelector)
      .next(pot.some([]))
      .select(latestTransactionsContinuationTokenSelector)
      .next(mockContinuationToken)
      .next()
      .isDone();
  });

  it(`should put ${getType(
    hidePaymentsReceiptAction.failure
  )} when response status is not 200 or 401`, () => {
    testSaga(
      handleDisableReceipt,
      mockDisablePaidNotice,
      hidePaymentsReceiptAction.request(requestPayload)
    )
      .next()
      .select(paymentAnalyticsDataSelector)
      .next(mockPaymentAnalyticsData)
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 500, value: undefined }))
      .put(
        hidePaymentsReceiptAction.failure({
          ...getGenericError(new Error("response status code 500"))
        })
      )
      .next()
      .isDone();
  });

  it(`should not put failure action when response status is 401 (handled by withPaymentsSessionToken)`, () => {
    testSaga(
      handleDisableReceipt,
      mockDisablePaidNotice,
      hidePaymentsReceiptAction.request(requestPayload)
    )
      .next()
      .select(paymentAnalyticsDataSelector)
      .next(mockPaymentAnalyticsData)
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 401, value: undefined }))
      .next()
      .next()
      .isDone();
  });

  it(`should put ${getType(
    hidePaymentsReceiptAction.failure
  )} when disablePaidNotice returns an error`, () => {
    testSaga(
      handleDisableReceipt,
      mockDisablePaidNotice,
      hidePaymentsReceiptAction.request(requestPayload)
    )
      .next()
      .select(paymentAnalyticsDataSelector)
      .next(mockPaymentAnalyticsData)
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .put(
        hidePaymentsReceiptAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    hidePaymentsReceiptAction.failure
  )} when an exception is thrown`, () => {
    const mockError = new Error("Network error");

    testSaga(
      handleDisableReceipt,
      mockDisablePaidNotice,
      hidePaymentsReceiptAction.request(requestPayload)
    )
      .next()
      .select(paymentAnalyticsDataSelector)
      .next(mockPaymentAnalyticsData)
      .throw(mockError)
      .put(
        hidePaymentsReceiptAction.failure({
          ...getNetworkError(mockError)
        })
      )
      .next()
      .isDone();
  });
});
