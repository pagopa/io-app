import { DiscountCodeTypeEnum } from "@io-app/api-types/generated/definitions/cgn/merchants/DiscountCodeType";
import { Merchant } from "@io-app/api-types/generated/definitions/cgn/merchants/Merchant";
import { SupportTypeEnum } from "@io-app/api-types/generated/definitions/cgn/merchants/SupportType";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { getType } from "typesafe-actions";

import { getGenericError } from "../../../../../../../utils/errors";
import { withRefreshApiCall } from "../../../../../../authentication/fastLogin/saga/utils";
import {
  cgnFeaturedOpportunities,
  cgnSelectedMerchant,
  cgnSelectedMerchantCancel
} from "../../../../store/actions/merchants";
import {
  cgnFeaturedOpportunitiesSaga,
  cgnMerchantDetail,
  cgnMerchantDetailUntilCancelled
} from "../cgnMerchantDetail";

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
      .next({ _tag: "Right", right: { status: 200, value: merchant } })
      .put(cgnSelectedMerchant.success(merchant))
      .next()
      .isDone();
  });

  it("should dispatch failure action on API error", () => {
    const leftResponse = { _tag: "Left", left: [] };
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
      .next({ _tag: "Right", right: { status: 401 } })
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

  it("should throw an error if API returns unexpected status", () => {
    const unexpectedStatus = 500;
    testSaga(cgnMerchantDetail, getMerchantsDetail, requestAction)
      .next()
      .next({ _tag: "Right", right: { status: unexpectedStatus } })
      .put(
        cgnSelectedMerchant.failure(
          getGenericError(new Error(`Response in status ${unexpectedStatus}`))
        )
      )
      .next()
      .isDone();
  });
});

describe("cgnFeaturedOpportunitiesSaga", () => {
  const discount = {
    id: "discount-id" as NonEmptyString,
    name: "Discount" as NonEmptyString,
    startDate: new Date("2020-01-01"),
    endDate: new Date("2099-12-31"),
    productCategories: []
  };
  const partner = { ...merchant, discounts: [discount] };
  const reference = { merchantId: merchant.id, discountId: discount.id };

  it("loads configured discounts in order and fetches each merchant only once", async () => {
    const getMerchant = jest.fn();
    const anotherDiscount = { ...discount, id: "another" as NonEmptyString };
    const loadedPartner = {
      ...partner,
      discounts: [discount, anotherDiscount]
    };
    await expectSaga(
      cgnFeaturedOpportunitiesSaga,
      getMerchant,
      cgnFeaturedOpportunities.request([
        { ...reference, discountId: anotherDiscount.id },
        reference
      ])
    )
      .provide([
        [
          matchers.call.fn(withRefreshApiCall),
          { right: { status: 200, value: loadedPartner } }
        ]
      ])
      .put(
        cgnFeaturedOpportunities.success([
          { merchant: loadedPartner, discount: anotherDiscount },
          { merchant: loadedPartner, discount }
        ])
      )
      .run();
    expect(getMerchant).toHaveBeenCalledTimes(1);
    expect(getMerchant).toHaveBeenCalledWith({ merchantId: merchant.id });
  });

  it.each([
    { name: "missing", discounts: [] },
    {
      name: "expired",
      discounts: [{ ...discount, endDate: new Date("2021-01-01") }]
    },
    {
      name: "not yet started",
      discounts: [{ ...discount, startDate: new Date("2099-01-01") }]
    }
  ])("omits $name opportunities", async ({ discounts }) => {
    await expectSaga(
      cgnFeaturedOpportunitiesSaga,
      jest.fn(),
      cgnFeaturedOpportunities.request([reference])
    )
      .provide([
        [
          matchers.call.fn(withRefreshApiCall),
          { right: { status: 200, value: { ...merchant, discounts } } }
        ]
      ])
      .put(cgnFeaturedOpportunities.success([]))
      .run();
  });

  it.each([
    { name: "not found", response: { right: { status: 404 } } },
    { name: "invalid response", response: { left: [] } }
  ])("omits merchants with $name responses", async ({ response }) => {
    await expectSaga(
      cgnFeaturedOpportunitiesSaga,
      jest.fn(),
      cgnFeaturedOpportunities.request([reference])
    )
      .provide([[matchers.call.fn(withRefreshApiCall), response]])
      .put(cgnFeaturedOpportunities.success([]))
      .run();
  });

  it("keeps available opportunities when another merchant request fails", async () => {
    const getMerchant = jest.fn();
    await expectSaga(
      cgnFeaturedOpportunitiesSaga,
      getMerchant,
      cgnFeaturedOpportunities.request([
        { ...reference, merchantId: "unavailable" as NonEmptyString },
        reference
      ])
    )
      .provide({
        call: () => {
          if (getMerchant.mock.calls.length === 1) {
            throw new Error("Network error");
          }
          return { right: { status: 200, value: partner } };
        }
      })
      .put(cgnFeaturedOpportunities.success([{ merchant: partner, discount }]))
      .run();
  });

  it("does not load more than three configured opportunities", async () => {
    const getMerchant = jest.fn();
    await expectSaga(
      cgnFeaturedOpportunitiesSaga,
      getMerchant,
      cgnFeaturedOpportunities.request(
        [1, 2, 3, 4].map(index => ({
          ...reference,
          merchantId: `merchant-${index}` as NonEmptyString
        }))
      )
    )
      .provide([
        [matchers.call.fn(withRefreshApiCall), { right: { status: 404 } }]
      ])
      .put(cgnFeaturedOpportunities.success([]))
      .run();
    expect(getMerchant).toHaveBeenCalledTimes(3);
  });

  it("does not emit success on an expired session", () => {
    testSaga(
      cgnFeaturedOpportunitiesSaga,
      jest.fn(),
      cgnFeaturedOpportunities.request([reference])
    )
      .next()
      .next({ right: { status: 401 } })
      .isDone();
  });

  it("clears opportunities without making requests when configuration is empty", async () => {
    const getMerchant = jest.fn();
    await expectSaga(
      cgnFeaturedOpportunitiesSaga,
      getMerchant,
      cgnFeaturedOpportunities.request([])
    )
      .put(cgnFeaturedOpportunities.success([]))
      .run();
    expect(getMerchant).not.toHaveBeenCalled();
  });

  it("does not repeat cards for duplicate references", async () => {
    await expectSaga(
      cgnFeaturedOpportunitiesSaga,
      jest.fn(),
      cgnFeaturedOpportunities.request([reference, reference])
    )
      .provide([
        [
          matchers.call.fn(withRefreshApiCall),
          { right: { status: 200, value: partner } }
        ]
      ])
      .put(cgnFeaturedOpportunities.success([{ merchant: partner, discount }]))
      .run();
  });
});

describe("cgnMerchantDetailUntilCancelled", () => {
  const requestAction = cgnSelectedMerchant.request(merchant.id);
  const getMerchant = jest.fn();
  const pendingResponse = new Promise<never>(() => undefined);

  it("should dispatch success when the detail request is not cancelled", async () => {
    await expectSaga(
      cgnMerchantDetailUntilCancelled,
      getMerchant,
      requestAction
    )
      .provide([
        [
          matchers.call.fn(withRefreshApiCall),
          { right: { status: 200, value: merchant } }
        ]
      ])
      .put(cgnSelectedMerchant.success(merchant))
      .run();
  });

  it("should not dispatch success when a featured selection cancels the pending request", async () => {
    await expectSaga(
      cgnMerchantDetailUntilCancelled,
      getMerchant,
      requestAction
    )
      .provide([[matchers.call.fn(withRefreshApiCall), pendingResponse]])
      .dispatch(cgnSelectedMerchantCancel())
      .not.put(cgnSelectedMerchant.success(merchant))
      .not.put.actionType(getType(cgnSelectedMerchant.failure))
      .run();
  });
});
