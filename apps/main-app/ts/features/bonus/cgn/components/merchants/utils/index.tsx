import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";
import I18n from "i18next";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { getCategorySpecs } from "../../../utils/filters";

export const normalizedDiscountPercentage = (discount?: number) => {
  const decodedDiscount = WithinRangeInteger(1, 100).decode(discount);
  if ("right" in decodedDiscount) {
    return decodedDiscount.right.toString();
  }

  return "-";
};

export const isValidDiscount = (discount?: number) =>
  "right" in WithinRangeInteger(1, 100).decode(discount);

export const moduleCGNaccessibilityLabel = (discountData: Discount) => {
  const { name, discount, productCategories, isNew } = discountData;

  const discountPercentage = isValidDiscount(discount)
    ? `${I18n.t("bonus.cgn.merchantsList.discountOf", {
        discount: normalizedDiscountPercentage(discount)
      })},`
    : "";

  const categories = `
    ${I18n.t("bonus.cgn.merchantsList.filter.categories")}:
    ${productCategories
      .map(categoryKey => {
        const category = getCategorySpecs(categoryKey);
        return category ? I18n.t(category.nameKey) : "";
      })
      .join(", ")}
      `;

  const isNewLabel = isNew ? `${I18n.t("bonus.cgn.merchantsList.news")},` : "";

  return `${name}, ${isNewLabel} ${discountPercentage} ${categories}`;
};
