import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
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

  it("should dispatch success action on successful API call", () => {
    const getMerchantsCount = jest.fn();
    testSaga(cgnSearchMerchantsSaga, getMerchantsCount, requestAction)
      .next()
      .next(E.right({ status: 200, value: { items } }))
      .put(cgnSearchMerchants.success(items))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const getMerchantsCount = jest.fn();
    const leftResponse = E.left([]);
    const expectedError = new Error(readableReport([]));

    testSaga(cgnSearchMerchantsSaga, getMerchantsCount, requestAction)
      .next()
      .next(leftResponse)
      .put(cgnSearchMerchants.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 401 response", () => {
    const getMerchantsCount = jest.fn();
    testSaga(cgnSearchMerchantsSaga, getMerchantsCount, requestAction)
      .next()
      .next(E.right({ status: 401 }))
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const getMerchantsCount = jest.fn();
    const networkError = new Error("Network error");

    testSaga(cgnSearchMerchantsSaga, getMerchantsCount, requestAction)
      .next()
      .throw(networkError)
      .put(cgnSearchMerchants.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });
});
