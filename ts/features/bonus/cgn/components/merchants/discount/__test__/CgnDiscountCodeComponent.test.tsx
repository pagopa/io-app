import { render } from "@testing-library/react-native";
import * as React from "react";
import CgnDiscountCodeComponent from "../CgnDiscountCodeComponent";
import { DiscountCodeTypeEnum } from "../../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { mockDiscount } from "../../../../__mock__/discount";

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
