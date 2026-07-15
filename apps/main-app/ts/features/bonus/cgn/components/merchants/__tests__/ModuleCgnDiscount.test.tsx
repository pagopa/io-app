import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";

import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { ProductCategoryEnum } from "../../../../../../../definitions/cgn/merchants/ProductCategory";
import { CategoryTag, ModuleCgnDiscount } from "../ModuleCgnDiscount";

describe("ModuleCgnDiscount", () => {
  const discount: Discount = {
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

  const onPressMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    const { getByText } = render(
      <ModuleCgnDiscount discount={discount} onPress={onPressMock} />
    );

    expect(getByText(I18n.t("bonus.cgn.merchantsList.news"))).toBeTruthy();
    expect(getByText("-25%")).toBeTruthy();
    expect(getByText("Small Rubber Chips")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const { getByRole } = render(
      <ModuleCgnDiscount discount={discount} onPress={onPressMock} />
    );
    fireEvent.press(getByRole("button"));
    expect(onPressMock).toHaveBeenCalled();
  });

  it("should hide badges when discount is invalid and item is not new", () => {
    const noBadgeDiscount = {
      ...discount,
      discount: 0,
      isNew: false
    } as Discount;

    const { queryByText } = render(
      <ModuleCgnDiscount discount={noBadgeDiscount} onPress={onPressMock} />
    );

    expect(queryByText(I18n.t("bonus.cgn.merchantsList.news"))).toBeNull();
    expect(queryByText("-0%")).toBeNull();
  });

  it("should not render a tag when category metadata is missing", () => {
    const { toJSON } = render(
      <CategoryTag category={"missing-category" as ProductCategoryEnum} />
    );

    expect(toJSON()).toBeNull();
  });
});
