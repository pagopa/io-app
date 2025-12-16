import { WithinRangeInteger } from "@pagopa/ts-commons/lib/numbers";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { getCategorySpecs } from "../../../utils/filters";

export const normalizedDiscountPercentage = (discount?: number) =>
  pipe(
    WithinRangeInteger(1, 100).decode(discount),
    E.map(v => v.toString()),
    E.getOrElse(() => "-")
  );

export const isValidDiscount = (discount?: number) =>
  pipe(WithinRangeInteger(1, 100).decode(discount), E.isRight);

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
        return O.isSome(category) ? I18n.t(category.value.nameKey as any) : "";
      })
      .join(", ")}
      `;

  const isNewLabel = isNew ? `${I18n.t("bonus.cgn.merchantsList.news")},` : "";

  return `${name}, ${isNewLabel} ${discountPercentage} ${categories}`;
};
