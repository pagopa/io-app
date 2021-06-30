import { render } from "@testing-library/react-native";
import React from "react";
import { LabelledItem, Props } from "../LabelledItem";
import { InputProps } from "../LabelledItem/Input";

jest.mock("react-navigation", () => ({
  NavigationEvents: "mockNavigationEvents"
}));

const textInputProps: InputProps = {
  type: "text",
  inputProps: { value: "value" }
};
const onPress = jest.fn();
const icon = "io-place";
const iconPosition = "left";

describe("Test LabelledItem", () => {
  it("should be not null", () => {
    const component = renderComponent(textInputProps);
    expect(component).not.toBeNull();
  });
  it("should render label if label prop is defined", () => {
    const component = renderComponent({ ...textInputProps, label: "label" });
    expect(component).not.toBeNull();
    expect(component.queryByTestId("label")).not.toBeNull();
  });
  it("should render NavigationEvents component if hasNavigationEvents prop is true and onPress prop is defined", () => {
    const component = renderComponent({
      ...textInputProps,
      hasNavigationEvents: true,
      onPress
    });
    expect(component).not.toBeNull();
    expect(component.queryByTestId("NavigationEvents")).not.toBeNull();
  });
  it("should render Icon component if iconPosition is left and icon prop is defined", () => {
    const component = renderComponent({
      ...textInputProps,
      iconPosition,
      icon
    });
    expect(component).not.toBeNull();
    expect(component.queryByTestId("Icon")).not.toBeNull();
  });
  it("should render Icon component if iconPosition is right and icon prop is defined", () => {
    const component = renderComponent({
      ...textInputProps,
      iconPosition: "right",
      icon
    });
    expect(component).not.toBeNull();
    expect(component.queryByTestId("Icon")).not.toBeNull();
  });
  it("should render description if description prop is defined", () => {
    const component = renderComponent({
      ...textInputProps,
      description: "description"
    });
    expect(component).not.toBeNull();
    expect(component.queryByTestId("description")).not.toBeNull();
  });
});

const renderComponent = (props: Props) => render(<LabelledItem {...props} />);
