import { DiscountCodeTypeEnum } from "@io-app/api-types/generated/definitions/cgn/merchants/DiscountCodeType";
import { OfflineMerchants } from "@io-app/api-types/generated/definitions/cgn/merchants/OfflineMerchants";
import { OnlineMerchants } from "@io-app/api-types/generated/definitions/cgn/merchants/OnlineMerchants";
import { ProductCategoryEnum } from "@io-app/api-types/generated/definitions/cgn/merchants/ProductCategory";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";

import { mixAndSortMerchants } from "../merchants";

describe("mixAndSortMerchants", () => {
  const onlineMerchants: OnlineMerchants["items"] = [
    {
      id: "1" as NonEmptyString,
      name: "Online Merchant A" as NonEmptyString,
      newDiscounts: true,
      discountCodeType: DiscountCodeTypeEnum.landingpage,
      productCategories: [ProductCategoryEnum.bankingServices],
      websiteUrl: "" as NonEmptyString
    },
    {
      id: "3" as NonEmptyString,
      name: "Online Merchant B" as NonEmptyString,
      newDiscounts: false,
      discountCodeType: DiscountCodeTypeEnum.api,
      productCategories: [ProductCategoryEnum.cultureAndEntertainment],
      websiteUrl: "" as NonEmptyString
    }
  ];

  const offlineMerchants: OfflineMerchants["items"] = [
    {
      id: "2" as NonEmptyString,
      name: "Offline Merchant A" as NonEmptyString,
      newDiscounts: false,
      address: {
        full_address: "Address A" as NonEmptyString
      },
      productCategories: []
    },
    {
      id: "4" as NonEmptyString,
      name: "Offline Merchant B" as NonEmptyString,
      newDiscounts: true,
      address: {
        full_address: "Address B" as NonEmptyString
      },
      productCategories: []
    }
  ];
  it("should mix and sort merchants correctly based on name and newDiscounts flag", () => {
    const result = mixAndSortMerchants(onlineMerchants, offlineMerchants);

    expect(result).toEqual([
      offlineMerchants[1],
      onlineMerchants[0],
      offlineMerchants[0],
      onlineMerchants[1]
    ]);
  });
});
