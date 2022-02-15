import { ProductCategoryEnum } from "../../../../../../definitions/cgn/merchants/ProductCategory";
import { Locales } from "../../../../../../locales/locales";
import { setLocale } from "../../../../../i18n";
import { orderCategoriesByNameKey } from "../filters";

const cases: ReadonlyArray<
  [
    ReadonlyArray<ProductCategoryEnum>,
    ReadonlyArray<ProductCategoryEnum>,
    Locales
  ]
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
