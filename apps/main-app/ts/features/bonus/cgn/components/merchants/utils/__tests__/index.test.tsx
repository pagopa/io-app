import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import I18n from "i18next";
import { Discount } from "../../../../../../../../definitions/cgn/merchants/Discount";
import { ProductCategoryEnum } from "../../../../../../../../definitions/cgn/merchants/ProductCategory";
import {
  isValidDiscount,
  moduleCGNaccessibilityLabel,
  normalizedDiscountPercentage
} from "../index";

describe("cgn merchants utils", () => {
  const discount: Discount = {
    id: "id" as NonEmptyString,
    name: "Discount name" as NonEmptyString,
    description: undefined,
    discount: 20,
    discountUrl: "https://example.com",
    endDate: new Date(),
    isNew: true,
    productCategories: [ProductCategoryEnum.cultureAndEntertainment],
    startDate: new Date()
  };

  it("normalizes valid discount and rejects invalid ones", () => {
    expect(normalizedDiscountPercentage(20)).toBe("20");
    expect(normalizedDiscountPercentage(0)).toBe("-");
    expect(isValidDiscount(20)).toBe(true);
    expect(isValidDiscount(0)).toBe(false);
  });

  it("builds accessibility label with new and discount metadata", () => {
    const label = moduleCGNaccessibilityLabel(discount);

    expect(label).toContain("Discount name");
    expect(label).toContain("20");
    expect(label).toContain(
      I18n.t("bonus.cgn.merchantsList.filter.categories")
    );
  });
});
