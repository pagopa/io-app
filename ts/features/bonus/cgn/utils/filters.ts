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
  [ProductCategoryEnum.foodDrink]: {
    type: ProductCategoryEnum.foodDrink,
    icon: "io-theater",
    nameKey: "bonus.cgn.merchantDetail.categories.theater"
  },
  [ProductCategoryEnum.travelling]: {
    type: ProductCategoryEnum.travelling,
    icon: "io-travel",
    nameKey: "bonus.cgn.merchantDetail.categories.travel"
  },
  [ProductCategoryEnum.shopping]: {
    type: ProductCategoryEnum.shopping,
    icon: "io-car",
    nameKey: "bonus.cgn.merchantDetail.categories.mobility"
  },
  [ProductCategoryEnum.services]: {
    type: ProductCategoryEnum.services,
    icon: "io-phone-vibration",
    nameKey: "bonus.cgn.merchantDetail.categories.telco"
  },
  [ProductCategoryEnum.learning]: {
    type: ProductCategoryEnum.learning,
    icon: "io-books",
    nameKey: "bonus.cgn.merchantDetail.categories.book"
  },
  [ProductCategoryEnum.entertainment]: {
    type: ProductCategoryEnum.entertainment,
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
  },
  [ProductCategoryEnum.hotels]: {
    type: ProductCategoryEnum.hotels,
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
