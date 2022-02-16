import { fromNullable, Option } from "fp-ts/lib/Option";
import { ComponentProps, FC } from "react";
import { SvgProps } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";
import { TranslationKeys } from "../../../../../locales/locales";
import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../../definitions/cgn/merchants/ProductCategory";
import Learning from "../../../../../img/bonus/cgn/categories/learning.svg";
import Sport from "../../../../../img/bonus/cgn/categories/sport.svg";
import Home from "../../../../../img/bonus/cgn/categories/home.svg";
import Travel from "../../../../../img/bonus/cgn/categories/travel.svg";
import Wellness from "../../../../../img/bonus/cgn/categories/wellness.svg";
import Culture from "../../../../../img/bonus/cgn/categories/culture.svg";
import Telco from "../../../../../img/bonus/cgn/categories/telephoneInternet.svg";
import Bank from "../../../../../img/bonus/cgn/categories/financialServices.svg";
import SustainableMobility from "../../../../../img/bonus/cgn/categories/sustainableMobility.svg";
import Job from "../../../../../img/bonus/cgn/categories/job.svg";
import I18n from "../../../../i18n";

export type Category = {
  type: ProductCategory;
  icon: FC<SvgProps>;
  nameKey: TranslationKeys;
  colors: ComponentProps<typeof LinearGradient>["colors"];
};

export const categories: Record<ProductCategory, Category> = {
  [ProductCategoryEnum.cultureAndEntertainment]: {
    type: ProductCategoryEnum.cultureAndEntertainment,
    icon: Culture,
    nameKey: "bonus.cgn.merchantDetail.categories.cultureAndEntertainment",
    colors: ["#C51C82", "#E28DC0"]
  },
  [ProductCategoryEnum.health]: {
    type: ProductCategoryEnum.health,
    icon: Wellness,
    nameKey: "bonus.cgn.merchantDetail.categories.health",
    colors: ["#F1901A", "#EE898A"]
  },
  [ProductCategoryEnum.learning]: {
    type: ProductCategoryEnum.learning,
    icon: Learning,
    nameKey: "bonus.cgn.merchantDetail.categories.learning",
    colors: ["#0871B6", "#AE97C3"]
  },
  [ProductCategoryEnum.sports]: {
    type: ProductCategoryEnum.sports,
    icon: Sport,
    nameKey: "bonus.cgn.merchantDetail.categories.sport",
    colors: ["#1D827D", "#83B8DA"]
  },
  [ProductCategoryEnum.home]: {
    type: ProductCategoryEnum.home,
    icon: Home,
    nameKey: "bonus.cgn.merchantDetail.categories.home",
    colors: ["#DC1415", "#F8C78C"]
  },
  [ProductCategoryEnum.telephonyAndInternet]: {
    type: ProductCategoryEnum.telephonyAndInternet,
    icon: Telco,
    nameKey: "bonus.cgn.merchantDetail.categories.telco",
    colors: ["#0871B6", "#83B8DA"]
  },
  [ProductCategoryEnum.bankingServices]: {
    type: ProductCategoryEnum.bankingServices,
    icon: Bank,
    nameKey: "bonus.cgn.merchantDetail.categories.finance",
    colors: ["#3E2F87", "#8FDBC0"]
  },
  [ProductCategoryEnum.travelling]: {
    type: ProductCategoryEnum.travelling,
    icon: Travel,
    nameKey: "bonus.cgn.merchantDetail.categories.travel",
    colors: ["#E00F69", "#F8C78C"]
  },
  [ProductCategoryEnum.sustainableMobility]: {
    type: ProductCategoryEnum.sustainableMobility,
    icon: SustainableMobility,
    nameKey: "bonus.cgn.merchantDetail.categories.mobility",
    colors: ["#1D827D", "#8FC7C5"]
  },
  [ProductCategoryEnum.jobOffers]: {
    type: ProductCategoryEnum.jobOffers,
    icon: Job,
    nameKey: "bonus.cgn.merchantDetail.categories.job",
    colors: ["#DC1415", "#EE898A"]
  }
};

export const getCategorySpecs = (category: ProductCategory): Option<Category> =>
  fromNullable(categories[category]);

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
  categories: ReadonlyArray<ProductCategoryEnum>
): ReadonlyArray<ProductCategoryEnum> =>
  [...categories].sort((c1, c2) => {
    const c1Specs = getCategorySpecs(c1);
    const c2Specs = getCategorySpecs(c2);
    if (c1Specs.isNone() && c2Specs.isSome()) {
      return 1;
    } else if (c1Specs.isSome() && c2Specs.isNone()) {
      return -1;
    } else if (c1Specs.isSome() && c2Specs.isSome()) {
      return I18n.t(c1Specs.value.nameKey)
        .toLocaleLowerCase()
        .localeCompare(I18n.t(c2Specs.value.nameKey).toLocaleLowerCase());
    }

    return 0;
  });
