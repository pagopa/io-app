import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { ProductCategoryEnum } from "../../../../../../../definitions/cgn/merchants/ProductCategory";
import { ModuleCgnDiscount } from "../ModuleCgnDiscount";

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
      <ModuleCgnDiscount onPress={onPressMock} discount={discount} />
    );

    expect(getByText(I18n.t("bonus.cgn.merchantsList.news"))).toBeTruthy();
    expect(getByText("-25%")).toBeTruthy();
    expect(getByText("Small Rubber Chips")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const { getByRole } = render(
      <ModuleCgnDiscount onPress={onPressMock} discount={discount} />
    );
    fireEvent.press(getByRole("button"));
    expect(onPressMock).toHaveBeenCalled();
  });
});
