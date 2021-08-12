import { fromNullable, Option } from "fp-ts/lib/Option";
import { TranslationKeys } from "../../../../../locales/locales";
import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../../definitions/cgn/merchants/ProductCategory";

export type Category = {
  type: ProductCategory;
  icon: string;
  nameKey: TranslationKeys;
};

export const categories: Record<ProductCategory, Category> = {
  [ProductCategoryEnum.arts]: {
    type: ProductCategoryEnum.arts,
    icon: "io-theater",
    nameKey: "bonus.cgn.merchantDetail.categories.theater"
  },
  [ProductCategoryEnum.travels]: {
    type: ProductCategoryEnum.travels,
    icon: "io-travel",
    nameKey: "bonus.cgn.merchantDetail.categories.travel"
  },
  [ProductCategoryEnum.transportation]: {
    type: ProductCategoryEnum.transportation,
    icon: "io-car",
    nameKey: "bonus.cgn.merchantDetail.categories.mobility"
  },
  [ProductCategoryEnum.connectivity]: {
    type: ProductCategoryEnum.connectivity,
    icon: "io-phone-vibration",
    nameKey: "bonus.cgn.merchantDetail.categories.telco"
  },
  [ProductCategoryEnum.books]: {
    type: ProductCategoryEnum.books,
    icon: "io-books",
    nameKey: "bonus.cgn.merchantDetail.categories.book"
  },
  [ProductCategoryEnum.entertainments]: {
    type: ProductCategoryEnum.entertainments,
    icon: "io-museums",
    nameKey: "bonus.cgn.merchantDetail.categories.museum"
  },
  [ProductCategoryEnum.sports]: {
    type: ProductCategoryEnum.sports,
    icon: "io-sports",
    nameKey: "bonus.cgn.merchantDetail.categories.sport"
  },
  [ProductCategoryEnum.health]: {
    type: ProductCategoryEnum.health,
    icon: "io-wellness",
    nameKey: "bonus.cgn.merchantDetail.categories.health"
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
