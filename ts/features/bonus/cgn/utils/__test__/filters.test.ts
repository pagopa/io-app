import {
  ProductCategory,
  ProductCategoryEnum
} from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { Locales } from "../../../../../../locales/locales";
import { setLocale } from "../../../../../i18n";
import { orderCategoriesByNameKey } from "../filters";

const cases: ReadonlyArray<
  [ReadonlyArray<ProductCategory>, ReadonlyArray<ProductCategory>, Locales]
> = [
  [
    [
      ProductCategoryEnum.jobOffers,
      ProductCategoryEnum.sustainableMobility,
      ProductCategoryEnum.home
    ],
    [
      ProductCategoryEnum.home,
      ProductCategoryEnum.jobOffers,
      ProductCategoryEnum.sustainableMobility
    ],
    "it"
  ],
  [
    [
      ProductCategoryEnum.jobOffers,
      ProductCategoryEnum.sustainableMobility,
      ProductCategoryEnum.home,
      "Unknown" as ProductCategory
    ],
    [
      ProductCategoryEnum.home,
      ProductCategoryEnum.jobOffers,
      ProductCategoryEnum.sustainableMobility,
      "Unknown" as ProductCategory
    ],
    "it"
  ],
  [
    [
      ProductCategoryEnum.jobOffers,
      ProductCategoryEnum.sustainableMobility,
      "Unknown 1" as ProductCategory,
      ProductCategoryEnum.home,
      "Unknown 2" as ProductCategory
    ],
    [
      ProductCategoryEnum.home,
      ProductCategoryEnum.jobOffers,
      ProductCategoryEnum.sustainableMobility,
      "Unknown 1" as ProductCategory,
      "Unknown 2" as ProductCategory
    ],
    "it"
  ],
  [
    [
      ProductCategoryEnum.home,
      ProductCategoryEnum.bankingServices,
      ProductCategoryEnum.cultureAndEntertainment
    ],
    [
      ProductCategoryEnum.cultureAndEntertainment,
      ProductCategoryEnum.bankingServices,
      ProductCategoryEnum.home
    ],
    "en"
  ]
];

describe("orderCategoriesByNameKey", () => {
  cases.forEach((c, i) =>
    it(`should order categories ${i}`, () => {
      setLocale(c[2] as Locales);
      expect(
        orderCategoriesByNameKey(c[0] as ReadonlyArray<ProductCategoryEnum>)
      ).toStrictEqual(c[1]);
    })
  );
});
