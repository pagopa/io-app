import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { render } from "@testing-library/react-native";
import I18n from "i18next";
import { Discount } from "../../../../../../../../definitions/cgn/merchants/Discount";
import { ProductCategoryEnum } from "../../../../../../../../definitions/cgn/merchants/ProductCategory";
import { CgnDiscountHeader } from "../CgnDiscountHeader";

const mockDiscount: Discount = {
  name: "Small Rubber Chips" as NonEmptyString,
  id: "28201" as NonEmptyString,
  description: undefined,
  discount: 25,
  discountUrl: "https://localhost",
  endDate: new Date(),
  isNew: true,
  productCategories: [ProductCategoryEnum.cultureAndEntertainment],
  startDate: new Date()
};

jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: jest.fn().mockImplementation(() => 200)
}));

describe("CgnDiscountHeader", () => {
  it("should render correctly with new discount", () => {
    const { getByText } = render(
      <CgnDiscountHeader discountDetails={mockDiscount} />
    );

    expect(getByText(I18n.t("bonus.cgn.merchantsList.news"))).toBeTruthy();
    expect(getByText("-25%")).toBeTruthy();
  });

  it("should render correctly without new discount", () => {
    const discountDetails = { ...mockDiscount, isNew: false };
    const { queryByText } = render(
      <CgnDiscountHeader discountDetails={discountDetails} />
    );

    expect(queryByText(I18n.t("bonus.cgn.merchantsList.news"))).toBeNull();
    expect(queryByText("-25%")).toBeTruthy();
  });

  it("should render correctly without discount", () => {
    const discountDetails = { ...mockDiscount, discount: 0 };
    const { queryByText } = render(
      <CgnDiscountHeader discountDetails={discountDetails} />
    );

    expect(queryByText(I18n.t("bonus.cgn.merchantsList.news"))).toBeTruthy();
    expect(queryByText("-0%")).toBeNull();
  });
});
