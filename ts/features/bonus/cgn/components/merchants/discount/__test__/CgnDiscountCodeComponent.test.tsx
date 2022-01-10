import { render } from "@testing-library/react-native";
import * as React from "react";
import { Discount } from "../../../../../../../../definitions/cgn/merchants/Discount";
import CgnDiscountCodeComponent from "../CgnDiscountCodeComponent";
import { DiscountCodeTypeEnum } from "../../../../../../../../definitions/cgn/merchants/DiscountCodeType";

const mockDiscount: Discount = {
  name: "a name" as any,
  startDate: new Date(),
  endDate: new Date(),
  productCategories: []
};

describe("when rendering", () => {
  it("should match the snapshot", () => {
    expect(
      render(
        <CgnDiscountCodeComponent
          discount={mockDiscount}
          merchantType={DiscountCodeTypeEnum.static}
        />
      ).toJSON()
    ).toMatchSnapshot();
  });
});

describe("when should not render", () => {
  it("should match the snapshot", () => {
    expect(
      render(
        <CgnDiscountCodeComponent
          discount={mockDiscount}
          merchantType={DiscountCodeTypeEnum.landingpage}
        />
      ).toJSON()
    ).toMatchSnapshot();
  });
});
