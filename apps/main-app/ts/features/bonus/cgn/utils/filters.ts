import {
  ProductCategory,
  ProductCategoryEnum
} from "@io-app/api-types/generated/definitions/cgn/merchants/ProductCategory";
import { ProductCategoryWithNewDiscountsCount } from "@io-app/api-types/generated/definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { HeaderSecondLevel, IOCategoryIcons } from "@io-app/design-system";
import I18n from "i18next";
import { StatusBarProps } from "react-native";

type Category = {
  colors: string;
  headerVariant: HeaderSecondLevel["variant"];
  icon: IOCategoryIcons;
  statusBarStyle: StatusBarProps["barStyle"];
  textColor: "black" | "white";
  type: ProductCategory;
};

const categories: Record<ProductCategory, Category> = {
  [ProductCategoryEnum.cultureAndEntertainment]: {
    type: ProductCategoryEnum.cultureAndEntertainment,
    icon: "categCulture",
    colors: "#AA338B",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.health]: {
    type: ProductCategoryEnum.health,
    icon: "categWellness",
    colors: "#B5D666",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  },
  [ProductCategoryEnum.learning]: {
    type: ProductCategoryEnum.learning,
    icon: "categLearning",
    colors: "#2A61AE",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.sports]: {
    type: ProductCategoryEnum.sports,
    icon: "categSport",
    colors: "#65BE72",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  },
  [ProductCategoryEnum.home]: {
    type: ProductCategoryEnum.home,
    icon: "categHome",
    colors: "#F8D547",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  },
  [ProductCategoryEnum.telephonyAndInternet]: {
    type: ProductCategoryEnum.telephonyAndInternet,
    icon: "categTelco",
    colors: "#0089C7",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.bankingServices]: {
    type: ProductCategoryEnum.bankingServices,
    icon: "categFinance",
    colors: "#4F51A3",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.travelling]: {
    type: ProductCategoryEnum.travelling,
    icon: "categTravel",
    colors: "#E02F6E",
    textColor: "white",
    statusBarStyle: "light-content",
    headerVariant: "contrast"
  },
  [ProductCategoryEnum.sustainableMobility]: {
    type: ProductCategoryEnum.sustainableMobility,
    icon: "categMobility",
    colors: "#00AEB1",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  },
  [ProductCategoryEnum.jobOffers]: {
    type: ProductCategoryEnum.jobOffers,
    icon: "categJobOffers",
    colors: "#FAAE56",
    textColor: "black",
    statusBarStyle: "dark-content",
    headerVariant: "neutral"
  }
};

export const getCategorySpecs = (
  category: ProductCategory
): Category | undefined => categories[category];

/**
 * Returns the category name in the current app language, translated at call
 * time so it reflects language changes.
 */
export const getCategoryName = (category: ProductCategory): string => {
  switch (category) {
    case ProductCategoryEnum.bankingServices:
      return I18n.t("bonus.cgn.merchantDetail.categories.finance");
    case ProductCategoryEnum.cultureAndEntertainment:
      return I18n.t(
        "bonus.cgn.merchantDetail.categories.cultureAndEntertainment"
      );
    case ProductCategoryEnum.health:
      return I18n.t("bonus.cgn.merchantDetail.categories.health");
    case ProductCategoryEnum.home:
      return I18n.t("bonus.cgn.merchantDetail.categories.home");
    case ProductCategoryEnum.jobOffers:
      return I18n.t("bonus.cgn.merchantDetail.categories.job");
    case ProductCategoryEnum.learning:
      return I18n.t("bonus.cgn.merchantDetail.categories.learning");
    case ProductCategoryEnum.sports:
      return I18n.t("bonus.cgn.merchantDetail.categories.sport");
    case ProductCategoryEnum.sustainableMobility:
      return I18n.t("bonus.cgn.merchantDetail.categories.mobility");
    case ProductCategoryEnum.telephonyAndInternet:
      return I18n.t("bonus.cgn.merchantDetail.categories.telco");
    case ProductCategoryEnum.travelling:
      return I18n.t("bonus.cgn.merchantDetail.categories.travel");
  }
};

export const orderCategoriesByNameKey = (
  categoriesList: ReadonlyArray<ProductCategoryWithNewDiscountsCount>
): ReadonlyArray<ProductCategoryWithNewDiscountsCount> =>
  [...categoriesList].sort((c1, c2) => {
    const c1Specs = categories[c1.productCategory];
    const c2Specs = categories[c2.productCategory];

    if (!c1Specs && c2Specs) {
      return 1;
    }

    if (c1Specs && !c2Specs) {
      return -1;
    }

    if (c1Specs && c2Specs) {
      return getCategoryName(c1Specs.type)
        .toLocaleLowerCase()
        .localeCompare(getCategoryName(c2Specs.type).toLocaleLowerCase());
    }

    return 0;
  });
