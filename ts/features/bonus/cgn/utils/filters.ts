import { fromNullable, Option } from "fp-ts/lib/Option";
import { FC } from "react";
import { SvgProps } from "react-native-svg";
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

export type Category = {
  type: ProductCategory;
  icon: FC<SvgProps>;
  nameKey: TranslationKeys;
};

export const categories: Record<ProductCategory, Category> = {
  [ProductCategoryEnum.cultureAndEntertainment]: {
    type: ProductCategoryEnum.cultureAndEntertainment,
    icon: Culture,
    nameKey: "bonus.cgn.merchantDetail.categories.cultureAndEntertainment"
  },
  [ProductCategoryEnum.health]: {
    type: ProductCategoryEnum.health,
    icon: Wellness,
    nameKey: "bonus.cgn.merchantDetail.categories.health"
  },
  [ProductCategoryEnum.learning]: {
    type: ProductCategoryEnum.learning,
    icon: Learning,
    nameKey: "bonus.cgn.merchantDetail.categories.learning"
  },
  [ProductCategoryEnum.sports]: {
    type: ProductCategoryEnum.sports,
    icon: Sport,
    nameKey: "bonus.cgn.merchantDetail.categories.sport"
  },
  [ProductCategoryEnum.home]: {
    type: ProductCategoryEnum.home,
    icon: Home,
    nameKey: "bonus.cgn.merchantDetail.categories.home"
  },
  [ProductCategoryEnum.telephonyAndInternet]: {
    type: ProductCategoryEnum.telephonyAndInternet,
    icon: Telco,
    nameKey: "bonus.cgn.merchantDetail.categories.telco"
  },
  [ProductCategoryEnum.bankingServices]: {
    type: ProductCategoryEnum.bankingServices,
    icon: Bank,
    nameKey: "bonus.cgn.merchantDetail.categories.finance"
  },
  [ProductCategoryEnum.travelling]: {
    type: ProductCategoryEnum.travelling,
    icon: Travel,
    nameKey: "bonus.cgn.merchantDetail.categories.travel"
  },
  [ProductCategoryEnum.sustainableMobility]: {
    type: ProductCategoryEnum.sustainableMobility,
    icon: SustainableMobility,
    nameKey: "bonus.cgn.merchantDetail.categories.mobility"
  },
  [ProductCategoryEnum.jobOffers]: {
    type: ProductCategoryEnum.jobOffers,
    icon: Job,
    nameKey: "bonus.cgn.merchantDetail.categories.job"
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
