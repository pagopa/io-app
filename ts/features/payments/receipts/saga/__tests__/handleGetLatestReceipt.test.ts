import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { NoticeListWrapResponse } from "../../../../../../definitions/pagopa/biz-events/NoticeListWrapResponse";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { getPaymentsLatestReceiptAction } from "../../store/actions";
import { handleGetLatestReceipt } from "../handleGetLatestReceipt";

describe("handleGetLatestReceipt", () => {
  const T_SESSION_TOKEN = "ABCD";

  const mockNotices: NoticeListWrapResponse["notices"] = [
    {
      eventId: "event1",
      payeeName: "Test Payee",
      payeeTaxCode: "12345678901",
      amount: "1000",
      isCart: false,
      isDebtor: false,
      isPayer: true,
      noticeDate: new Date().toISOString()
    }
  ];

  it(`should put ${getType(
    getPaymentsLatestReceiptAction.success
  )} when response is 200 with data`, () => {
    const mockGetTransactionList = jest.fn();

    const mockContinuationToken = "token123";
    const mockHeaders = {
      "x-continuation-token": mockContinuationToken
    };

    testSaga(
      handleGetLatestReceipt,
      mockGetTransactionList,
      getPaymentsLatestReceiptAction.request()
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(
        E.right({
          status: 200,
          value: { notices: mockNotices },
          headers: { map: mockHeaders }
        })
      )
      .put(
        getPaymentsLatestReceiptAction.success({
          data: mockNotices,
          continuationToken: mockContinuationToken
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsLatestReceiptAction.success
  )} when response is 200 without continuation token`, () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetLatestReceipt,
      mockGetTransactionList,
      getPaymentsLatestReceiptAction.request()
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(
        E.right({
          status: 200,
          value: { notices: mockNotices },
          headers: {}
        })
      )
      .put(
        getPaymentsLatestReceiptAction.success({
          data: mockNotices,
          continuationToken: undefined
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsLatestReceiptAction.success
  )} with empty data when response is 404`, () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetLatestReceipt,
      mockGetTransactionList,
      getPaymentsLatestReceiptAction.request()
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 404, value: undefined }))
      .put(
        getPaymentsLatestReceiptAction.success({
          data: [],
          continuationToken: undefined
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsLatestReceiptAction.failure
  )} when response status is not 200, 404 or 401`, () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetLatestReceipt,
      mockGetTransactionList,
      getPaymentsLatestReceiptAction.request()
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 500, value: undefined }))
      .put(
        getPaymentsLatestReceiptAction.failure({
          ...getGenericError(new Error("response status code 500"))
        })
      )
      .next()
      .isDone();
  });

  it(`should not put failure action when response status is 401 (handled by withPaymentsSessionToken)`, () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetLatestReceipt,
      mockGetTransactionList,
      getPaymentsLatestReceiptAction.request()
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 401, value: undefined }))
      .next()
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsLatestReceiptAction.failure
  )} when getTransactionList returns an error`, () => {
    const mockGetTransactionList = jest.fn();
    testSaga(
      handleGetLatestReceipt,
      mockGetTransactionList,
      getPaymentsLatestReceiptAction.request()
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .put(
        getPaymentsLatestReceiptAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsLatestReceiptAction.failure
  )} when an exception is thrown`, () => {
    const mockGetTransactionList = jest.fn();
    const mockError = new Error("Network error");

    testSaga(
      handleGetLatestReceipt,
      mockGetTransactionList,
      getPaymentsLatestReceiptAction.request()
    )
      .next()
      .throw(mockError)
      .put(
        getPaymentsLatestReceiptAction.failure({
          ...getNetworkError(mockError)
        })
      )
      .next()
      .isDone();
  });
});
