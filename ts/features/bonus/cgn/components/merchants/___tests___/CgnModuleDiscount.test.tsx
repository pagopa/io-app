import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { ProductCategoryEnum } from "../../../../../../../definitions/cgn/merchants/ProductCategory";
import I18n from "../../../../../../i18n";
import { CgnModuleDiscount } from "../CgnModuleDiscount";

describe("CgnModuleDiscount", () => {
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
      <CgnModuleDiscount onPress={onPressMock} discount={discount} />
    );

    expect(getByText(I18n.t("bonus.cgn.merchantsList.news"))).toBeTruthy();
    expect(getByText("-25%")).toBeTruthy();
    expect(getByText("Small Rubber Chips")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const { getByRole } = render(
      <CgnModuleDiscount onPress={onPressMock} discount={discount} />
    );
    fireEvent.press(getByRole("button"));
    expect(onPressMock).toHaveBeenCalled();
  });
});
