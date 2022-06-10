import { render } from "@testing-library/react-native";
import * as React from "react";
import CgnDiscountCodeComponent from "../CgnDiscountCodeComponent";
import { DiscountCodeTypeEnum } from "../../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { mockDiscount } from "../../../../__mock__/discount";

const mockFunc = (_: string) => jest.fn();

describe("when rendering", () => {
  it("should match the snapshot", () => {
    expect(
      render(
        <CgnDiscountCodeComponent
          discount={mockDiscount}
          merchantType={DiscountCodeTypeEnum.static}
          onCodePress={mockFunc}
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
          onCodePress={mockFunc}
        />
      ).toJSON()
    ).toMatchSnapshot();
  });
});
