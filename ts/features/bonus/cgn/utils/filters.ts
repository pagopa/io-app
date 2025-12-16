import {
  HeaderSecondLevel,
  IOCategoryIcons
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { StatusBarProps } from "react-native";
import I18n from "i18next";
import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../../definitions/cgn/merchants/ProductCategory";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { TranslationKeys } from "../../../../../locales/locales";

type Category = {
  type: ProductCategory;
  icon: IOCategoryIcons;
  nameKey: TranslationKeys;
  colors: string;
  textColor: "white" | "black";
  statusBarStyle: StatusBarProps["barStyle"];
  headerVariant: HeaderSecondLevel["variant"];
};

export const categories: Record<ProductCategory, Category> = {
  [ProductCategoryEnum.cultureAndEntertainment]: {
    type: ProductCategoryEnum.cultureAndEntertainment,
    icon: "categCulture",
    nameKey: "bonus.cgn.merchantDetail.categories.cultureAndEntertainment",
    colors: "#AA338B",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.health]: {
    type: ProductCategoryEnum.health,
    icon: "categWellness",
    nameKey: "bonus.cgn.merchantDetail.categories.health",
    colors: "#B5D666",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  },
  [ProductCategoryEnum.learning]: {
    type: ProductCategoryEnum.learning,
    icon: "categLearning",
    nameKey: "bonus.cgn.merchantDetail.categories.learning",
    colors: "#2A61AE",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.sports]: {
    type: ProductCategoryEnum.sports,
    icon: "categSport",
    nameKey: "bonus.cgn.merchantDetail.categories.sport",
    colors: "#65BE72",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  },
  [ProductCategoryEnum.home]: {
    type: ProductCategoryEnum.home,
    icon: "categHome",
    nameKey: "bonus.cgn.merchantDetail.categories.home",
    colors: "#F8D547",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  },
  [ProductCategoryEnum.telephonyAndInternet]: {
    type: ProductCategoryEnum.telephonyAndInternet,
    icon: "categTelco",
    nameKey: "bonus.cgn.merchantDetail.categories.telco",
    colors: "#0089C7",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.bankingServices]: {
    type: ProductCategoryEnum.bankingServices,
    icon: "categFinance",
    nameKey: "bonus.cgn.merchantDetail.categories.finance",
    colors: "#4F51A3",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.travelling]: {
    type: ProductCategoryEnum.travelling,
    icon: "categTravel",
    nameKey: "bonus.cgn.merchantDetail.categories.travel",
    colors: "#E02F6E",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.sustainableMobility]: {
    type: ProductCategoryEnum.sustainableMobility,
    icon: "categMobility",
    nameKey: "bonus.cgn.merchantDetail.categories.mobility",
    colors: "#00AEB1",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  },
  [ProductCategoryEnum.jobOffers]: {
    type: ProductCategoryEnum.jobOffers,
    icon: "categJobOffers",
    nameKey: "bonus.cgn.merchantDetail.categories.job",
    colors: "#FAAE56",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  }
};

export const getCategorySpecs = (
  category: ProductCategory
): O.Option<Category> => O.fromNullable(categories[category]);

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
      return I18n.t(c1Specs.value.nameKey as any)
        .toLocaleLowerCase()
        .localeCompare(
          I18n.t(c2Specs.value.nameKey as any).toLocaleLowerCase()
        );
    }

    return 0;
  });
