import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import I18n from "i18next";
import { Discount } from "../../../../../../../../definitions/cgn/merchants/Discount";
import { ProductCategoryEnum } from "../../../../../../../../definitions/cgn/merchants/ProductCategory";
import {
  isValidDiscount,
  moduleCGNaccessibilityLabel,
  normalizedDiscountPercentage
} from "../index";
import { categories } from "../../../../utils/filters";

describe("normalizedDiscountPercentage", () => {
  it("should return the discount as a string if within range", () => {
    expect(normalizedDiscountPercentage(50)).toBe("50");
  });

  it("should return '-' if the discount is out of range", () => {
    expect(normalizedDiscountPercentage(150)).toBe("-");
    expect(isValidDiscount(0)).toBe(false);
  });

  it("should return '-' if the discount is undefined", () => {
    expect(normalizedDiscountPercentage()).toBe("-");
  });
});

describe("isValidDiscount", () => {
  it("should return true if the discount is within range", () => {
    expect(isValidDiscount(50)).toBe(true);
  });

  it("should return false if the discount is out of range", () => {
    expect(isValidDiscount(150)).toBe(false);
    expect(isValidDiscount(0)).toBe(false);
  });

  it("should return false if the discount is undefined", () => {
    expect(isValidDiscount()).toBe(false);
  });
});

describe("moduleCGNaccessibilityLabel", () => {
  const mockDiscount: Discount = {
    name: "name" as NonEmptyString,
    discount: 50,
    productCategories: [ProductCategoryEnum.bankingServices],
    isNew: true,
    endDate: new Date(),
    id: "id" as NonEmptyString,
    startDate: new Date()
  };

  it("should return the correct accessibility label", () => {
    const accessibilityLabel = moduleCGNaccessibilityLabel(mockDiscount);
    expect(accessibilityLabel).toContain(mockDiscount.name);
    expect(accessibilityLabel).toContain(
      I18n.t("bonus.cgn.merchantsList.news")
    );
    expect(accessibilityLabel).toContain(
      I18n.t("bonus.cgn.merchantsList.discountOf", {
        discount: normalizedDiscountPercentage(mockDiscount.discount)
      })
    );
    expect(accessibilityLabel).toContain(
      I18n.t("bonus.cgn.merchantsList.filter.categories")
    );
  });

  it("should return the correct accessibility label with no discount", () => {
    const accessibilityLabel = moduleCGNaccessibilityLabel({
      ...mockDiscount,
      discount: undefined
    });
    expect(accessibilityLabel).toContain(mockDiscount.name);
    expect(accessibilityLabel).toContain(
      I18n.t("bonus.cgn.merchantsList.news")
    );
    expect(accessibilityLabel).not.toContain(
      I18n.t("bonus.cgn.merchantsList.discountOf", {
        discount: normalizedDiscountPercentage(mockDiscount.discount)
      })
    );
  });

  it("should return the correct accessibility label with no new label", () => {
    const accessibilityLabel = moduleCGNaccessibilityLabel({
      ...mockDiscount,
      isNew: false
    });
    expect(accessibilityLabel).toContain(mockDiscount.name);
    expect(accessibilityLabel).not.toContain(
      I18n.t("bonus.cgn.merchantsList.news")
    );
  });

  it("should return the correct accessibility label with no discount and no new", () => {
    const accessibilityLabel = moduleCGNaccessibilityLabel({
      ...mockDiscount,
      discount: undefined,
      isNew: false
    });
    expect(accessibilityLabel).toContain(mockDiscount.name);
    expect(accessibilityLabel).not.toContain(
      I18n.t("bonus.cgn.merchantsList.news")
    );
    expect(accessibilityLabel).not.toContain(
      I18n.t("bonus.cgn.merchantsList.discountOf", {
        discount: normalizedDiscountPercentage(mockDiscount.discount)
      })
    );
  });

  it("should return the correct accessibility label with multiple categories", () => {
    const accessibilityLabel = moduleCGNaccessibilityLabel({
      ...mockDiscount,
      productCategories: [
        ProductCategoryEnum.bankingServices,
        ProductCategoryEnum.health
      ]
    });
    expect(accessibilityLabel).toContain(mockDiscount.name);
    expect(accessibilityLabel).toContain(
      I18n.t(categories[ProductCategoryEnum.bankingServices].nameKey as any)
    );
    expect(accessibilityLabel).toContain(
      I18n.t(categories[ProductCategoryEnum.health].nameKey as any)
    );
  });
});
