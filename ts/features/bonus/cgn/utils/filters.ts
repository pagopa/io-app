import { TranslationKeys } from "../../../../../locales/locales";

export type CategoryType =
  | "theater"
  | "travel"
  | "books"
  | "health"
  | "telco"
  | "sport"
  | "museum"
  | "mobility";

export type Category = {
  type: CategoryType;
  icon: string;
  nameKey: TranslationKeys;
};

export const categories: ReadonlyArray<Category> = [
  {
    type: "theater",
    icon: "io-theater",
    nameKey: "bonus.cgn.merchantDetail.categories.theater"
  },
  {
    type: "travel",
    icon: "io-travel",
    nameKey: "bonus.cgn.merchantDetail.categories.travel"
  },
  {
    type: "mobility",
    icon: "io-car",
    nameKey: "bonus.cgn.merchantDetail.categories.mobility"
  },
  {
    type: "telco",
    icon: "io-phone-vibration",
    nameKey: "bonus.cgn.merchantDetail.categories.telco"
  },
  {
    type: "books",
    icon: "io-books",
    nameKey: "bonus.cgn.merchantDetail.categories.book"
  },
  {
    type: "museum",
    icon: "io-museums",
    nameKey: "bonus.cgn.merchantDetail.categories.museum"
  },
  {
    type: "sport",
    icon: "io-sports",
    nameKey: "bonus.cgn.merchantDetail.categories.sport"
  },
  {
    type: "health",
    icon: "io-wellness",
    nameKey: "bonus.cgn.merchantDetail.categories.health"
  }
];

export type OrderType = {
  label: TranslationKeys;
  value: string;
};

export const orders: ReadonlyArray<OrderType> = [
  {
    label: "bonus.cgn.merchantsList.filter.order.byDistance",
    value: "distance"
  },
  {
    label: "bonus.cgn.merchantsList.filter.order.byName",
    value: "alphabetical"
  }
];
