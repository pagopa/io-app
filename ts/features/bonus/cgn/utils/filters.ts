import * as O from "fp-ts/lib/Option";
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
import { ProductCategoryWithNewDiscountsCount } from "../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";
import { getGradientColorValues } from "../../../../components/core/variables/IOColors";

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
    colors: getGradientColorValues("cgnCulture")
  },
  [ProductCategoryEnum.health]: {
    type: ProductCategoryEnum.health,
    icon: Wellness,
    nameKey: "bonus.cgn.merchantDetail.categories.health",
    colors: getGradientColorValues("cgnHealth")
  },
  [ProductCategoryEnum.learning]: {
    type: ProductCategoryEnum.learning,
    icon: Learning,
    nameKey: "bonus.cgn.merchantDetail.categories.learning",
    colors: getGradientColorValues("cgnLearning")
  },
  [ProductCategoryEnum.sports]: {
    type: ProductCategoryEnum.sports,
    icon: Sport,
    nameKey: "bonus.cgn.merchantDetail.categories.sport",
    colors: getGradientColorValues("cgnSport")
  },
  [ProductCategoryEnum.home]: {
    type: ProductCategoryEnum.home,
    icon: Home,
    nameKey: "bonus.cgn.merchantDetail.categories.home",
    colors: getGradientColorValues("cgnHome")
  },
  [ProductCategoryEnum.telephonyAndInternet]: {
    type: ProductCategoryEnum.telephonyAndInternet,
    icon: Telco,
    nameKey: "bonus.cgn.merchantDetail.categories.telco",
    colors: getGradientColorValues("cgnTelco")
  },
  [ProductCategoryEnum.bankingServices]: {
    type: ProductCategoryEnum.bankingServices,
    icon: Bank,
    nameKey: "bonus.cgn.merchantDetail.categories.finance",
    colors: getGradientColorValues("cgnFinance")
  },
  [ProductCategoryEnum.travelling]: {
    type: ProductCategoryEnum.travelling,
    icon: Travel,
    nameKey: "bonus.cgn.merchantDetail.categories.travel",
    colors: getGradientColorValues("cgnTravel")
  },
  [ProductCategoryEnum.sustainableMobility]: {
    type: ProductCategoryEnum.sustainableMobility,
    icon: SustainableMobility,
    nameKey: "bonus.cgn.merchantDetail.categories.mobility",
    colors: getGradientColorValues("cgnMobility")
  },
  [ProductCategoryEnum.jobOffers]: {
    type: ProductCategoryEnum.jobOffers,
    icon: Job,
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
