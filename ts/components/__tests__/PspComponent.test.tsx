import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { none, some } from "fp-ts/lib/Option";
import { Psp } from "../../types/pagopa";
import { PspComponent } from "../wallet/payment/PspComponent";
import * as hooks from "../../features/wallet/onboarding/bancomat/screens/hooks/useImageResize";

const psp: Psp = {
  id: 0,
  fixedCost: { amount: 10 },
  logoPSP:
    "https://acardste.vaservices.eu:1443/pp-restapi/v1/resources/psp/43188"
};

describe("Test PspComponent", () => {
  it("should call onPress if psp button is pressed", () => {
    const onPress = jest.fn();
    const component = renderComponent(onPress);

    fireEvent.press(component.getByTestId("psp-0"));
    expect(onPress).toHaveBeenCalled();
  });
  it("should show the logoPSP if there is one and useImageResize return some value", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(some([15, 15]));
    const onPress = jest.fn();
    const component = renderComponent(onPress);
    const logoPSP = component.queryByTestId("logoPSP");

    expect(logoPSP).not.toBeNull();
    expect(logoPSP).toHaveProp("source", { uri: psp.logoPSP });
  });
  it("should show the businessName if there isn't logoPSP", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const onPress = jest.fn();
    const component = renderComponent(onPress);
    const businessName = component.queryByTestId("businessName");

    expect(businessName).not.toBeNull();
  });
});

const renderComponent = (onPress: () => void) =>
  render(<PspComponent psp={psp} onPress={onPress} />);
