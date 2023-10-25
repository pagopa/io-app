import * as O from "fp-ts/lib/Option";
import { ComponentProps } from "react";
import LinearGradient from "react-native-linear-gradient";
import {
  IOCategoryIcons,
  getGradientColorValues
} from "@pagopa/io-app-design-system";
import { TranslationKeys } from "../../../../../locales/locales";
import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../../definitions/cgn/merchants/ProductCategory";
import I18n from "../../../../i18n";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";

export type Category = {
  type: ProductCategory;
  icon: IOCategoryIcons;
  nameKey: TranslationKeys;
  colors: ComponentProps<typeof LinearGradient>["colors"];
};

export const categories: Record<ProductCategory, Category> = {
  [ProductCategoryEnum.cultureAndEntertainment]: {
    type: ProductCategoryEnum.cultureAndEntertainment,
    icon: "categCulture",
    nameKey: "bonus.cgn.merchantDetail.categories.cultureAndEntertainment",
    colors: getGradientColorValues("cgnCulture")
  },
  [ProductCategoryEnum.health]: {
    type: ProductCategoryEnum.health,
    icon: "categWellness",
    nameKey: "bonus.cgn.merchantDetail.categories.health",
    colors: getGradientColorValues("cgnHealth")
  },
  [ProductCategoryEnum.learning]: {
    type: ProductCategoryEnum.learning,
    icon: "categLearning",
    nameKey: "bonus.cgn.merchantDetail.categories.learning",
    colors: getGradientColorValues("cgnLearning")
  },
  [ProductCategoryEnum.sports]: {
    type: ProductCategoryEnum.sports,
    icon: "categSport",
    nameKey: "bonus.cgn.merchantDetail.categories.sport",
    colors: getGradientColorValues("cgnSport")
  },
  [ProductCategoryEnum.home]: {
    type: ProductCategoryEnum.home,
    icon: "categHome",
    nameKey: "bonus.cgn.merchantDetail.categories.home",
    colors: getGradientColorValues("cgnHome")
  },
  [ProductCategoryEnum.telephonyAndInternet]: {
    type: ProductCategoryEnum.telephonyAndInternet,
    icon: "categTelco",
    nameKey: "bonus.cgn.merchantDetail.categories.telco",
    colors: getGradientColorValues("cgnTelco")
  },
  [ProductCategoryEnum.bankingServices]: {
    type: ProductCategoryEnum.bankingServices,
    icon: "categFinance",
    nameKey: "bonus.cgn.merchantDetail.categories.finance",
    colors: getGradientColorValues("cgnFinance")
  },
  [ProductCategoryEnum.travelling]: {
    type: ProductCategoryEnum.travelling,
    icon: "categTravel",
    nameKey: "bonus.cgn.merchantDetail.categories.travel",
    colors: getGradientColorValues("cgnTravel")
  },
  [ProductCategoryEnum.sustainableMobility]: {
    type: ProductCategoryEnum.sustainableMobility,
    icon: "categMobility",
    nameKey: "bonus.cgn.merchantDetail.categories.mobility",
    colors: getGradientColorValues("cgnMobility")
  },
  [ProductCategoryEnum.jobOffers]: {
    type: ProductCategoryEnum.jobOffers,
    icon: "categJobOffers",
    nameKey: "bonus.cgn.merchantDetail.categories.job",
    colors: getGradientColorValues("cgnJobOffers")
  }
};

export const getCategorySpecs = (
  category: ProductCategory
): O.Option<Category> => O.fromNullable(categories[category]);

export type OrderType = {
  label: TranslationKeys;
  value: string;
};

// export const orders: ReadonlyArray<OrderType> = [
//   {
//     label: "bonus.cgn.merchantsList.filter.order.byDistance",
//     value: "distance"
//   },
//   {
//     label: "bonus.cgn.merchantsList.filter.order.byName",
//     value: "alphabetical"
//   }
// ];

export const orders: Record<string, OrderType> = {
  distance: {
    label: "bonus.cgn.merchantsList.filter.order.byDistance",
    value: "distance"
  },
  name: {
    label: "bonus.cgn.merchantsList.filter.order.byName",
    value: "alphabetical"
  }
};

export const CATEGORY_GRADIENT_ANGLE = 57.23;

export const orderCategoriesByNameKey = (
  categories: ReadonlyArray<ProductCategoryWithNewDiscountsCount>
): ReadonlyArray<ProductCategoryWithNewDiscountsCount> =>
  [...categories].sort((c1, c2) => {
    const c1Specs = getCategorySpecs(c1.productCategory);
    const c2Specs = getCategorySpecs(c2.productCategory);
    if (O.isNone(c1Specs) && O.isSome(c2Specs)) {
      return 1;
    } else if (O.isSome(c1Specs) && O.isNone(c2Specs)) {
      return -1;
    } else if (O.isSome(c1Specs) && O.isSome(c2Specs)) {
      return I18n.t(c1Specs.value.nameKey)
        .toLocaleLowerCase()
        .localeCompare(I18n.t(c2Specs.value.nameKey).toLocaleLowerCase());
    }

    return 0;
  });
