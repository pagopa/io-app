import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { CountResult } from "../../../../../../../../definitions/cgn/merchants/CountResult";
import { getGenericError } from "../../../../../../../utils/errors";
import {
  cgnMerchantsCount,
  cgnSearchMerchants
} from "../../../../store/actions/merchants";
import { cgnGetMerchantsCountSaga } from "../cgnGetMerchantsCountSaga";

describe("cgnGetMerchantsCountSaga", () => {
  const countResult: CountResult = { count: 42 };
  const requestAction = cgnMerchantsCount.request();
  const getMerchantsCount = jest.fn();

  it("should dispatch success action on successful API call", () => {
    testSaga(cgnGetMerchantsCountSaga, getMerchantsCount, requestAction)
      .next()
      .next(E.right({ status: 200, value: countResult }))
      .put(cgnMerchantsCount.success(countResult))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = E.left([]);
    const expectedError = new Error(readableReport([]));

    testSaga(cgnGetMerchantsCountSaga, getMerchantsCount, requestAction)
      .next()
      .next(leftResponse)
      .put(cgnMerchantsCount.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 401 response", () => {
    testSaga(cgnGetMerchantsCountSaga, getMerchantsCount, requestAction)
      .next()
      .next(E.right({ status: 401 }))
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnGetMerchantsCountSaga, getMerchantsCount, requestAction)
      .next()
      .throw(networkError)
      .put(cgnSearchMerchants.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });
});
