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

const OPERATOR_NAME = "Operator FOO";
describe("when rendering", () => {
  it("on match snapshot for static code", () => {
    expect(
      getComponent(
        mockDiscount,
        OPERATOR_NAME,
        DiscountCodeTypeEnum.static
      ).toJSON()
    ).toMatchSnapshot();
  });

  it("on render static discount", () => {
    const component = getComponent(
      mockDiscount,
      OPERATOR_NAME,
      DiscountCodeTypeEnum.static
    );
    expect(component.queryByTestId("discount-detail")).toBeDefined();
    expect(component.queryByTestId("static-code-component")).toBeDefined();
    expect(component.queryByTestId("otp-code-component")).toBeNull();
    expect(component.queryByTestId("bucket-code-component")).toBeNull();
  });

  it("on match snapshot for OTP discount", () => {
    expect(
      getComponent(
        mockDiscount,
        OPERATOR_NAME,
        DiscountCodeTypeEnum.api
      ).toJSON()
    ).toMatchSnapshot();
  });

  it("on render otp discount", () => {
    const component = getComponent(
      mockDiscount,
      OPERATOR_NAME,
      DiscountCodeTypeEnum.api
    );
    expect(component.queryByTestId("discount-detail")).toBeDefined();
    expect(component.queryByTestId("static-code-component")).toBeNull();
    expect(component.queryByTestId("otp-code-component")).toBeDefined();
    expect(component.queryByTestId("bucket-code-component")).toBeNull();
  });

  it("on match snapshot for bucket discount", () => {
    expect(
      getComponent(mockDiscount, DiscountCodeTypeEnum.bucket).toJSON()
    ).toMatchSnapshot();
  });

  it("on render bucket discount", () => {
    const component = getComponent(
      mockDiscount,
      OPERATOR_NAME,
      DiscountCodeTypeEnum.bucket
    );
    expect(component.queryByTestId("discount-detail")).toBeDefined();
    expect(component.queryByTestId("static-code-component")).toBeNull();
    expect(component.queryByTestId("otp-code-component")).toBeNull();
    expect(component.queryByTestId("bucket-code-component")).toBeDefined();
  });

  it("on match snapshot for landing page discount", () => {
    expect(
      getComponent(
        mockDiscount,
        OPERATOR_NAME,
        DiscountCodeTypeEnum.landingpage
      ).toJSON()
    ).toMatchSnapshot();
  });

  it("on render landing discount", () => {
    const component = getComponent(
      mockDiscount,
      OPERATOR_NAME,
      DiscountCodeTypeEnum.landingpage
    );

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
    const component = getComponent(
      testDiscount,
      OPERATOR_NAME,
      DiscountCodeTypeEnum.static
    );
    expect(component.queryByTestId("discount-detail")).toBeDefined();
    expect(component.getByTestId("discount-condition")).toBeDefined();
    expect(component.getByTestId("discount-condition")).toHaveTextContent(
      "A discount condition"
    );
    expect(component.getByTestId("discount-description")).toBeDefined();
    expect(component.getByTestId("discount-description")).toHaveTextContent(
      "A discount description"
    );
  });
});

const getComponent = (
  discount: Discount,
  operatorName: string,
  merchantType?: DiscountCodeType
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore({
    ...globalState
  } as GlobalState);

  return render(
    <Provider store={store}>
      <CgnDiscountDetail
        discount={discount}
        merchantType={merchantType}
        operatorName={operatorName}
      />
    </Provider>
  );
};
