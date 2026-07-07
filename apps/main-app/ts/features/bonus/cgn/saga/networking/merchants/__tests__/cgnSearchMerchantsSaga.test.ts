import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { testSaga } from "redux-saga-test-plan";
import { getGenericError } from "../../../../../../../utils/errors";
import { cgnSearchMerchants } from "../../../../store/actions/merchants";
import { cgnSearchMerchantsSaga } from "../cgnSearchMerchantsSaga";
import { SearchResult } from "../../../../../../../../definitions/cgn/merchants/SearchResult";

const items: SearchResult["items"] = [
  {
    description: "Test Merchant" as NonEmptyString,
    id: "merchant-1" as NonEmptyString,
    name: "Test Merchant" as NonEmptyString,
    newDiscounts: false
  }
];

describe("cgnSearchMerchantsSaga", () => {
  const requestAction = cgnSearchMerchants.request(
    "merchant-id" as NonEmptyString
  );
  const fetchMerchantsCount = jest.fn();

  it("should dispatch success action on successful API call", () => {
    testSaga(cgnSearchMerchantsSaga, fetchMerchantsCount, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: 200, value: { items } } })
      .put(cgnSearchMerchants.success(items))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = { _tag: "Left", left: [] };
    const expectedError = new Error(readableReport([]));

    testSaga(cgnSearchMerchantsSaga, fetchMerchantsCount, requestAction)
      .next()
      .next(leftResponse)
      .put(cgnSearchMerchants.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 401 response", () => {
    testSaga(cgnSearchMerchantsSaga, fetchMerchantsCount, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: 401 } })
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnSearchMerchantsSaga, fetchMerchantsCount, requestAction)
      .next()
      .throw(networkError)
      .put(cgnSearchMerchants.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });

  it("should throw an error if API returns unexpected status", () => {
    const unexpectedStatus = 500;
    testSaga(cgnSearchMerchantsSaga, fetchMerchantsCount, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: unexpectedStatus } })
      .put(
        cgnSearchMerchants.failure(
          getGenericError(new Error(`Response in status ${unexpectedStatus}`))
        )
      )
      .next()
      .isDone();
  });
});
