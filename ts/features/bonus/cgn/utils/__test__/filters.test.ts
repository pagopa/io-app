import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { Locales } from "../../../../../../locales/locales";
import { setLocale } from "../../../../../i18n";
import { orderCategoriesByNameKey } from "../filters";
import { ProductCategoryWithNewDiscountsCount } from "../../../../../../definitions/cgn/merchants/ProductCategoryWithNewDiscountsCount";

const cases: ReadonlyArray<
  [
    ReadonlyArray<ProductCategoryWithNewDiscountsCount>,
    ReadonlyArray<ProductCategoryWithNewDiscountsCount>,
    Locales
  ]
> = [
  [
    [
      { productCategory: ProductCategoryEnum.jobOffers, newDiscounts: 0 },
      {
        productCategory: ProductCategoryEnum.sustainableMobility,
        newDiscounts: 0
      },
      { productCategory: ProductCategoryEnum.home, newDiscounts: 0 }
    ],
    [
      { productCategory: ProductCategoryEnum.home, newDiscounts: 0 },
      { productCategory: ProductCategoryEnum.jobOffers, newDiscounts: 0 },
      {
        productCategory: ProductCategoryEnum.sustainableMobility,
        newDiscounts: 0
      }
    ],
    "it"
  ],
  [
    [
      { productCategory: ProductCategoryEnum.jobOffers, newDiscounts: 0 },
      {
        productCategory: ProductCategoryEnum.sustainableMobility,
        newDiscounts: 0
      },
      { productCategory: ProductCategoryEnum.home, newDiscounts: 0 },
      { productCategory: "Unknown" as ProductCategory, newDiscounts: 0 }
    ],
    [
      { productCategory: ProductCategoryEnum.home, newDiscounts: 0 },
      { productCategory: ProductCategoryEnum.jobOffers, newDiscounts: 0 },
      {
        productCategory: ProductCategoryEnum.sustainableMobility,
        newDiscounts: 0
      },
      { productCategory: "Unknown" as ProductCategory, newDiscounts: 0 }
    ],
    "it"
  ],
  [
    [
      { productCategory: ProductCategoryEnum.jobOffers, newDiscounts: 0 },
      {
        productCategory: ProductCategoryEnum.sustainableMobility,
        newDiscounts: 0
      },
      { productCategory: "Unknown 1" as ProductCategory, newDiscounts: 0 },
      { productCategory: ProductCategoryEnum.home, newDiscounts: 0 },
      { productCategory: "Unknown 2" as ProductCategory, newDiscounts: 0 }
    ],
    [
      { productCategory: ProductCategoryEnum.home, newDiscounts: 0 },
      { productCategory: ProductCategoryEnum.jobOffers, newDiscounts: 0 },
      {
        productCategory: ProductCategoryEnum.sustainableMobility,
        newDiscounts: 0
      },
      { productCategory: "Unknown 1" as ProductCategory, newDiscounts: 0 },
      { productCategory: "Unknown 2" as ProductCategory, newDiscounts: 0 }
    ],
    "it"
  ],
  [
    [
      { productCategory: ProductCategoryEnum.home, newDiscounts: 0 },
      { productCategory: ProductCategoryEnum.bankingServices, newDiscounts: 0 },
      {
        productCategory: ProductCategoryEnum.cultureAndEntertainment,
        newDiscounts: 0
      }
    ],
    [
      { productCategory: ProductCategoryEnum.bankingServices, newDiscounts: 0 },
      {
        productCategory: ProductCategoryEnum.cultureAndEntertainment,
        newDiscounts: 0
      },
      { productCategory: ProductCategoryEnum.home, newDiscounts: 0 }
    ],
    "en"
  ]
];

describe("orderCategoriesByNameKey", () => {
  cases.forEach((c, i) =>
    it(`should order categories ${i}`, () => {
      setLocale(c[2] as Locales);
      expect(
        orderCategoriesByNameKey(
          c[0] as ReadonlyArray<ProductCategoryWithNewDiscountsCount>
        )
      ).toStrictEqual(c[1]);
    })
  );
});
