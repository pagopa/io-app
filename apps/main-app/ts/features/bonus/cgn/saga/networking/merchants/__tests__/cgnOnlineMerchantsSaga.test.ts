import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { testSaga } from "redux-saga-test-plan";

import { DiscountCodeTypeEnum } from "../../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { OnlineMerchants } from "../../../../../../../../definitions/cgn/merchants/OnlineMerchants";
import { ProductCategoryEnum } from "../../../../../../../../definitions/cgn/merchants/ProductCategory";
import { getGenericError } from "../../../../../../../utils/errors";
import { cgnOnlineMerchants } from "../../../../store/actions/merchants";
import { cgnOnlineMerchantsSaga } from "../cgnOnlineMerchantsSaga";

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
  const getOnlineMerchants = jest.fn();

  it("should dispatch success action on successful API call", () => {
    testSaga(cgnOnlineMerchantsSaga, getOnlineMerchants, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: 200, value: { items } } })
      .put(cgnOnlineMerchants.success(items))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = { _tag: "Left", left: [] };
    const expectedError = new Error(readableReport([]));

    testSaga(cgnOnlineMerchantsSaga, getOnlineMerchants, requestAction)
      .next()
      .next(leftResponse)
      .put(cgnOnlineMerchants.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 401 response", () => {
    testSaga(cgnOnlineMerchantsSaga, getOnlineMerchants, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: 401 } })
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnOnlineMerchantsSaga, getOnlineMerchants, requestAction)
      .next()
      .throw(networkError)
      .put(cgnOnlineMerchants.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });

  it("should throw an error if API returns unexpected status", () => {
    const unexpectedStatus = 500;
    testSaga(cgnOnlineMerchantsSaga, getOnlineMerchants, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: unexpectedStatus } })
      .put(
        cgnOnlineMerchants.failure(
          getGenericError(new Error(`Response in status ${unexpectedStatus}`))
        )
      )
      .next()
      .isDone();
  });
});
