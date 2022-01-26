import { fromNullable, Option } from "fp-ts/lib/Option";
import { FC } from "react";
import { SvgProps } from "react-native-svg";
import { TranslationKeys } from "../../../../../locales/locales";
import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../../definitions/cgn/merchants/ProductCategory";
import Books from "../../../../../img/bonus/cgn/categories/books.svg";
import Sport from "../../../../../img/bonus/cgn/categories/sport.svg";
import Theater from "../../../../../img/bonus/cgn/categories/theater.svg";
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

//   CultureAndEntertainment
//   Learning
//   Health
//   Sports
//   Home
//   TelephonyAndInternet
//   BankingServices
//   Travelling
//   SustainableMobility
//   JobOffers

export const categories: Record<string, Category> = {
  CultureAndEntertainment: {
    type: ProductCategoryEnum.entertainment,
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
    icon: Books,
    nameKey: "bonus.cgn.merchantDetail.categories.learning"
  },
  [ProductCategoryEnum.sports]: {
    type: ProductCategoryEnum.sports,
    icon: Sport,
    nameKey: "bonus.cgn.merchantDetail.categories.sport"
  },
  Home: {
    // FIXME replace with correct enum key
    type: ProductCategoryEnum.entertainment,
    icon: Theater,
    nameKey: "bonus.cgn.merchantDetail.categories.cultureAndEntertainment"
  },
  TelephonyAndInternet: {
    // FIXME replace with correct enum key
    type: ProductCategoryEnum.entertainment,
    icon: Telco,
    nameKey: "bonus.cgn.merchantDetail.categories.telco"
  },
  BankingServices: {
    // FIXME replace with correct enum key
    type: ProductCategoryEnum.entertainment,
    icon: Bank,
    nameKey: "bonus.cgn.merchantDetail.categories.finance"
  },
  [ProductCategoryEnum.travelling]: {
    type: ProductCategoryEnum.travelling,
    icon: Travel,
    nameKey: "bonus.cgn.merchantDetail.categories.travel"
  },
  SustainableMobility: {
    // FIXME replace with correct enum key
    type: ProductCategoryEnum.travelling,
    icon: SustainableMobility,
    nameKey: "bonus.cgn.merchantDetail.categories.mobility"
  },
  JobOffers: {
    // FIXME replace with correct enum key
    type: ProductCategoryEnum.travelling,
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
