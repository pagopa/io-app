import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getGenericError } from "../../../../../../../utils/errors";
import { cgnSelectedMerchant } from "../../../../store/actions/merchants";
import { cgnMerchantDetail } from "../cgnMerchantDetail";
import { Merchant } from "../../../../../../../../definitions/cgn/merchants/Merchant";
import { SupportTypeEnum } from "../../../../../../../../definitions/cgn/merchants/SupportType";
import { DiscountCodeTypeEnum } from "../../../../../../../../definitions/cgn/merchants/DiscountCodeType";

const merchant: Merchant = {
  id: "12345" as NonEmptyString,
  name: "Test Merchant" as NonEmptyString,
  description: "Description of test merchant" as NonEmptyString,
  websiteUrl: "https://example.com" as NonEmptyString,
  allNationalAddresses: false,
  discounts: [],
  supportType: SupportTypeEnum.EMAILADDRESS,
  supportValue: "10" as NonEmptyString,
  discountCodeType: DiscountCodeTypeEnum.api
};

describe("cgnMerchantDetail", () => {
  const requestAction = cgnSelectedMerchant.request(
    "merchant-id" as NonEmptyString
  );
  const getMerchantsDetail = jest.fn();
  it("should dispatch success action on successful API call", () => {
    testSaga(cgnMerchantDetail, getMerchantsDetail, requestAction)
      .next()
      .next(E.right({ status: 200, value: merchant }))
      .put(cgnSelectedMerchant.success(merchant))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = E.left([]);
    const expectedError = new Error(readableReport([]));

    testSaga(cgnMerchantDetail, getMerchantsDetail, requestAction)
      .next()
      .next(leftResponse)
      .put(cgnSelectedMerchant.failure(getGenericError(expectedError)))
      .next()
      .isDone();
  });

  it("should not dispatch success or failure on 401 response", () => {
    testSaga(cgnMerchantDetail, getMerchantsDetail, requestAction)
      .next()
      .next(E.right({ status: 401 }))
      .next()
      .isDone();
  });

  it("should throw an error on network failure", () => {
    const networkError = new Error("Network error");

    testSaga(cgnMerchantDetail, getMerchantsDetail, requestAction)
      .next()
      .throw(networkError)
      .put(cgnSelectedMerchant.failure(getGenericError(networkError)))
      .next()
      .isDone();
  });
});
