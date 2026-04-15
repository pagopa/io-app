import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { getPaymentsReceiptAction } from "../../store/actions";
import { handleGetReceipt } from "../handleGetReceipt";

describe("handleGetReceipt", () => {
  const T_SESSION_TOKEN = "ABCD";
  const mockNotices = [
    {
      eventId: "event",
      payeeName: "Test Payee",
      payeeTaxCode: "12345678901",
      amount: "1000",
      isCart: false,
      isDebtor: false,
      isPayer: true,
      noticeDate: new Date().toISOString()
    }
  ];

  const mockDebtorNotices = new Array(3).map((_, index) => ({
    eventId: `event${index}`,
    payeeName: "Debtor Payee",
    payeeTaxCode: "10987654321",
    amount: "2000",
    isCart: false,
    isDebtor: true,
    isPayer: false,
    noticeDate: new Date().toISOString()
  }));

  const mockPayerNotices = new Array(3).map((_, index) => ({
    eventId: `event${index}`,
    payeeName: "Debtor Payee",
    payeeTaxCode: "10987654321",
    amount: "2000",
    isCart: false,
    isDebtor: false,
    isPayer: true,
    noticeDate: new Date().toISOString()
  }));

  it(`should put ${getType(
    getPaymentsReceiptAction.success
  )} when response is 200 with data`, () => {
    const mockGetTransactionList = jest.fn();

    const onSuccess = jest.fn();

    testSaga(
      handleGetReceipt,
      mockGetTransactionList,
      getPaymentsReceiptAction.request({
        firstLoad: true,
        onSuccess
      })
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(
        E.right({
          status: 200,
          value: { notices: mockNotices }
        })
      )
      .put(
        getPaymentsReceiptAction.success({
          data: mockNotices,
          appendElements: true
        })
      )
      .next()
      .isDone();

    expect(onSuccess).toHaveBeenCalled();
  });

  it(`should put ${getType(
    getPaymentsReceiptAction.success
  )} when response is 200`, () => {
    const mockGetTransactionList = jest.fn();
    const onSuccess = jest.fn();

    testSaga(
      handleGetReceipt,
      mockGetTransactionList,
      getPaymentsReceiptAction.request({
        firstLoad: false,
        onSuccess
      })
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
        getPaymentsReceiptAction.success({
          data: mockNotices,
          appendElements: false
        })
      )
      .next()
      .isDone();

    expect(onSuccess).toHaveBeenCalledWith(undefined);
  });

  it(`should put ${getType(
    getPaymentsReceiptAction.success
  )} with empty data when response is 404`, () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetReceipt,
      mockGetTransactionList,
      getPaymentsReceiptAction.request({})
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 404, value: undefined }))
      .put(getPaymentsReceiptAction.success({ data: [] }))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsReceiptAction.failure
  )} when response status is not 200, 404 or 401`, () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetReceipt,
      mockGetTransactionList,
      getPaymentsReceiptAction.request({})
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 500, value: undefined }))
      .put(
        getPaymentsReceiptAction.failure({
          ...getGenericError(new Error("response status code 500"))
        })
      )
      .next()
      .isDone();
  });

  it(`should not put failure action when response status is 401 (handled by withPaymentsSessionToken)`, () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetReceipt,
      mockGetTransactionList,
      getPaymentsReceiptAction.request({})
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 401, value: undefined }))
      .next()
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsReceiptAction.failure
  )} when getTransactionList returns an error`, () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetReceipt,
      mockGetTransactionList,
      getPaymentsReceiptAction.request({})
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .put(
        getPaymentsReceiptAction.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsReceiptAction.failure
  )} when an exception is thrown`, () => {
    const mockGetTransactionList = jest.fn();
    const mockError = new Error("Network error");

    testSaga(
      handleGetReceipt,
      mockGetTransactionList,
      getPaymentsReceiptAction.request({})
    )
      .next()
      .throw(mockError)
      .put(
        getPaymentsReceiptAction.failure({
          ...getNetworkError(mockError)
        })
      )
      .next()
      .isDone();
  });

  it("should apply correct filters for debtor category", () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetReceipt,
      mockGetTransactionList,
      getPaymentsReceiptAction.request({
        noticeCategory: "debtor",
        size: 20,
        continuationToken: "token456"
      })
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(
        E.right({
          status: 200,
          value: { notices: mockDebtorNotices },
          headers: {}
        })
      )
      .put(
        getPaymentsReceiptAction.success({
          data: mockDebtorNotices,
          appendElements: undefined
        })
      )
      .next()
      .isDone();
  });

  it("should apply correct filters for payer category", () => {
    const mockGetTransactionList = jest.fn();

    testSaga(
      handleGetReceipt,
      mockGetTransactionList,
      getPaymentsReceiptAction.request({
        noticeCategory: "payer",
        size: 15
      })
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(
        E.right({
          status: 200,
          value: { notices: mockPayerNotices },
          headers: {}
        })
      )
      .put(
        getPaymentsReceiptAction.success({
          data: mockPayerNotices,
          appendElements: undefined
        })
      )
      .next()
      .isDone();
  });
});
