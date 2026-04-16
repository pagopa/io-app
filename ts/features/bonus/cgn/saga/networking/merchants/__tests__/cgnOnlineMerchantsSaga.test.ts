import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getGenericError } from "../../../../../../../utils/errors";
import { cgnOnlineMerchantsSaga } from "../cgnOnlineMerchantsSaga";
import { cgnOnlineMerchants } from "../../../../store/actions/merchants";
import { OnlineMerchants } from "../../../../../../../../definitions/cgn/merchants/OnlineMerchants";
import { ProductCategoryEnum } from "../../../../../../../../definitions/cgn/merchants/ProductCategory";
import { DiscountCodeTypeEnum } from "../../../../../../../../definitions/cgn/merchants/DiscountCodeType";

const items: OnlineMerchants["items"] = [
  {
    id: "merchant-1" as NonEmptyString,
    name: "Test Merchant" as NonEmptyString,
    productCategories: [ProductCategoryEnum.cultureAndEntertainment],
    websiteUrl: "https://example.com" as NonEmptyString,
    discountCodeType: DiscountCodeTypeEnum.static,
    newDiscounts: false
  }
];

describe("cgnOnlineMerchantsSaga", () => {
  const requestAction = cgnOnlineMerchants.request(
    "merchant-id" as NonEmptyString
  );

  it("should dispatch success action on successful API call", () => {
    const getMerchantsCount = jest.fn();
    testSaga(cgnOnlineMerchantsSaga, getMerchantsCount, requestAction)
      .next()
      .next(E.right({ status: 200, value: { items } }))
      .put(cgnOnlineMerchants.success(items))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const getMerchantsCount = jest.fn();
    const leftResponse = E.left([]);
    const expectedError = new Error(readableReport([]));

    testSaga(cgnOnlineMerchantsSaga, getMerchantsCount, requestAction)
      .next()
      .next(leftResponse)
      .put(cgnOnlineMerchants.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 401 response", () => {
    const getMerchantsCount = jest.fn();
    testSaga(cgnOnlineMerchantsSaga, getMerchantsCount, requestAction)
      .next()
      .next(E.right({ status: 401 }))
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const getMerchantsCount = jest.fn();
    const networkError = new Error("Network error");

    testSaga(cgnOnlineMerchantsSaga, getMerchantsCount, requestAction)
      .next()
      .throw(networkError)
      .put(cgnOnlineMerchants.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });
});
