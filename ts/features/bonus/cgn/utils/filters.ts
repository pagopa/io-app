import { fromNullable, Option } from "fp-ts/lib/Option";
import { FC } from "react";
import { SvgProps } from "react-native-svg";
import { TranslationKeys } from "../../../../../locales/locales";
import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../../definitions/cgn/merchants/ProductCategory";
import Books from "../../../../../img/bonus/cgn/categories/books.svg";
import Hotel from "../../../../../img/bonus/cgn/categories/hotel.svg";
import Restaurant from "../../../../../img/bonus/cgn/categories/restaurant.svg";
import Shopping from "../../../../../img/bonus/cgn/categories/shopping.svg";
import Sport from "../../../../../img/bonus/cgn/categories/sport.svg";
import Telefonia from "../../../../../img/bonus/cgn/categories/telefonia.svg";
import Theater from "../../../../../img/bonus/cgn/categories/theater.svg";
import Travel from "../../../../../img/bonus/cgn/categories/travel.svg";
import Wellness from "../../../../../img/bonus/cgn/categories/wellness.svg";

export type Category = {
  type: ProductCategory;
  icon: FC<SvgProps>;
  nameKey: TranslationKeys;
};

export const categories: Record<ProductCategory, Category> = {
  [ProductCategoryEnum.entertainment]: {
    type: ProductCategoryEnum.entertainment,
    icon: Theater,
    nameKey: "bonus.cgn.merchantDetail.categories.theater"
  },
  [ProductCategoryEnum.travelling]: {
    type: ProductCategoryEnum.travelling,
    icon: Travel,
    nameKey: "bonus.cgn.merchantDetail.categories.travel"
  },
  [ProductCategoryEnum.foodDrink]: {
    type: ProductCategoryEnum.foodDrink,
    icon: Restaurant,
    nameKey: "bonus.cgn.merchantDetail.categories.food"
  },
  [ProductCategoryEnum.services]: {
    type: ProductCategoryEnum.services,
    icon: Telefonia,
    nameKey: "bonus.cgn.merchantDetail.categories.service"
  },
  [ProductCategoryEnum.learning]: {
    type: ProductCategoryEnum.learning,
    icon: Books,
    nameKey: "bonus.cgn.merchantDetail.categories.book"
  },
  [ProductCategoryEnum.hotels]: {
    type: ProductCategoryEnum.hotels,
    icon: Hotel,
    nameKey: "bonus.cgn.merchantDetail.categories.hotel"
  },
  [ProductCategoryEnum.sports]: {
    type: ProductCategoryEnum.sports,
    icon: Sport,
    nameKey: "bonus.cgn.merchantDetail.categories.sport"
  },
  [ProductCategoryEnum.health]: {
    type: ProductCategoryEnum.health,
    icon: Wellness,
    nameKey: "bonus.cgn.merchantDetail.categories.health"
  },
  [ProductCategoryEnum.shopping]: {
    type: ProductCategoryEnum.shopping,
    icon: Shopping,
    nameKey: "bonus.cgn.merchantDetail.categories.shopping"
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
