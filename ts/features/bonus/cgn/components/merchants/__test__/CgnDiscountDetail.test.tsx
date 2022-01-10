import * as React from "react";
import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { mockDiscount } from "../../../__mock__/discount";
import {
  DiscountCodeType,
  DiscountCodeTypeEnum
} from "../../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { CgnDiscountDetail } from "../CgnDiscountDetail";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../store/reducers/types";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";

describe("when rendering", () => {
  it("on render static discount", () => {
    const component = getComponent(mockDiscount, DiscountCodeTypeEnum.static);
    expect(
      getComponent(mockDiscount, DiscountCodeTypeEnum.static).toJSON()
    ).toMatchSnapshot();
    expect(component.queryByTestId("discount-detail")).toBeDefined();
    expect(component.queryByTestId("static-code-component")).toBeDefined();
  });

  it("on render otp discount", () => {
    const component = getComponent(mockDiscount, DiscountCodeTypeEnum.api);
    expect(
      getComponent(mockDiscount, DiscountCodeTypeEnum.api).toJSON()
    ).toMatchSnapshot();
    expect(component.queryByTestId("discount-detail")).toBeDefined();
    expect(component.queryByTestId("static-code-component")).toBeNull();
    expect(component.queryByTestId("otp-code-component")).toBeDefined();
  });

  it("on render landing discount", () => {
    const component = getComponent(
      mockDiscount,
      DiscountCodeTypeEnum.landingpage
    );
    expect(
      getComponent(mockDiscount, DiscountCodeTypeEnum.landingpage).toJSON()
    ).toMatchSnapshot();

    expect(component.queryByTestId("discount-detail")).toBeDefined();
    expect(component.queryByTestId("static-code-component")).toBeNull();
    expect(component.queryByTestId("otp-code-component")).toBeNull();
  });
});

describe("check discount info rendering", () => {
  it("render discount information", () => {
    const testDiscount: Discount = {
      ...mockDiscount,
      description: "A discount description" as Discount["description"],
      condition: "A discount condition" as Discount["condition"],
      productCategories: []
    };
    const component = getComponent(testDiscount, DiscountCodeTypeEnum.static);
    expect(component.queryByTestId("discount-detail")).toBeDefined();
    if (testDiscount.condition) {
      expect(component.getByTestId("discount-condition")).toBeDefined();
      expect(component.getByTestId("discount-condition")).toHaveTextContent(
        testDiscount.condition
      );
    }
    if (testDiscount.description) {
      expect(component.getByTestId("discount-description")).toBeDefined();
      expect(component.getByTestId("discount-description")).toHaveTextContent(
        testDiscount.description
      );
    }
  });
});

const getComponent = (discount: Discount, merchantType?: DiscountCodeType) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore({
    ...globalState
  } as GlobalState);

  return render(
    <Provider store={store}>
      <CgnDiscountDetail discount={discount} merchantType={merchantType} />
    </Provider>
  );
};
