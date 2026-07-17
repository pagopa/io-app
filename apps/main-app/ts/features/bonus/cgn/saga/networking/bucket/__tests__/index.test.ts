import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { testSaga } from "redux-saga-test-plan";

import { cgnBucketConsuption } from "..";
import { Discount } from "../../../../../../../../definitions/cgn/merchants/Discount";
import { getGenericError } from "../../../../../../../utils/errors";
import { cgnCodeFromBucket } from "../../../../store/actions/bucket";
import { setMerchantDiscountCode } from "../../../../store/actions/merchants";
import { DiscountBucketCodeResponse } from "../../../../types/DiscountBucketCodeResponse";

describe("cgnBucketConsuption", () => {
  const request = cgnCodeFromBucket.request({
    discountId: "discount-id" as Discount["id"],
    onSuccess: jest.fn(),
    onError: jest.fn()
  });
  const unsubscribeRequest = jest.fn();

  it(`should dispatch success on 200 response`, () => {
    testSaga(cgnBucketConsuption, unsubscribeRequest, request)
      .next()
      .next({
        _tag: "Right",
        right: { status: 200, value: { code: "discount-code" } }
      })
      .put(
        cgnCodeFromBucket.success({
          kind: "success",
          value: { code: "discount-code" }
        } as DiscountBucketCodeResponse)
      )
      .next()
      .put(setMerchantDiscountCode("discount-code"))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = { _tag: "Left", left: [] };
    const expectedError = new Error(readableReport([]));

    testSaga(cgnBucketConsuption, unsubscribeRequest, request)
      .next()
      .next(leftResponse)
      .put(cgnCodeFromBucket.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 402 response", () => {
    testSaga(cgnBucketConsuption, unsubscribeRequest, request)
      .next()
      .next({ _tag: "Right", right: { status: 402 } })
      .put(cgnCodeFromBucket.success({ kind: "unhandled" }))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 404 response", () => {
    testSaga(cgnBucketConsuption, unsubscribeRequest, request)
      .next()
      .next({ _tag: "Right", right: { status: 404 } })
      .put(cgnCodeFromBucket.success({ kind: "notFound" }))
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnBucketConsuption, unsubscribeRequest, request)
      .next()
      .throw(networkError)
      .put(cgnCodeFromBucket.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });
});
