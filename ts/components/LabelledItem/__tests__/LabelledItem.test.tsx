import { fireEvent } from "@testing-library/react-native";
import { isString } from "lodash";
import React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import { LabelledItem, Props } from "../index";

const textInputProps = {
  inputProps: { value: "value" }
} as Props;
const textInputMaskProps = {
  inputMaskProps: {
    value: "value",
    type: "custom",
    options: {
      mask: "9999 9999 9999 9999 999"
    }
  }
} as Props;
const onPress = jest.fn();
const icon = "io-place";
const iconPosition = "left";
const testID = "Text";
const description = "description text";

describe("Test LabelledItem", () => {
  it("should render label if is defined", () => {
    const label = "label text";
    const component = renderComponent({ ...textInputProps, label });
    expect(component.queryByTestId("label")).not.toBeNull();
    expect(component.queryByText(label)).toBeTruthy();
  });

  it("should render ButtonDefaultOpacity if iconPosition is left and icon is defined", () => {
    const component = renderComponent({
      ...textInputProps,
      iconPosition,
      icon
    });
    expect(component.queryByTestId("ButtonDefaultOpacity")).not.toBeNull();
  });

  it("should render ButtonDefaultOpacity if iconPosition is right and icon is defined", () => {
    const component = renderComponent({
      ...textInputProps,
      iconPosition: "right",
      icon
    });
    expect(component.queryByTestId("ButtonDefaultOpacity")).not.toBeNull();
  });

  it("should render description if is defined", () => {
    const component = renderComponent({
      ...textInputProps,
      description
    });
    expect(component.queryByTestId("description")).not.toBeNull();
    expect(component.queryByText(description)).toBeTruthy();
  });

  describe("when `inputMaskProps` is defined", () => {
    it("should render TextInputMask", () => {
      const component = renderComponent({
        ...textInputMaskProps,
        testID
      });
      expect(component.queryByTestId(`${testID}InputMask`)).not.toBeNull();
    });
    it("should not render the InputNativeBase", () => {
      const component = renderComponent({
        ...textInputMaskProps,
        testID
      });
      expect(component.queryByTestId(`${testID}Input`)).toBeNull();
    });
  });

  describe("when `inputProps` is defined", () => {
    it("should render the InputNativeBase", () => {
      const component = renderComponent({
        ...textInputProps,
        testID
      });
      expect(component.queryByTestId(`${testID}Input`)).not.toBeNull();
    });
    it("should not render TextInputMask", () => {
      const component = renderComponent({
        ...textInputProps,
        testID
      });
      expect(component.queryByTestId(`${testID}InputMask`)).toBeNull();
    });
  });

  it("should render IconFont if icon is a string", () => {
    const component = renderComponent({
      ...textInputProps,
      iconPosition,
      icon
    });
    expect(component.queryByTestId("ButtonDefaultOpacity")).not.toBeNull();
    expect(isString(icon)).toBeTruthy();
    expect(component.queryByTestId("LabelledItem_IconFont")).not.toBeNull();
  });

  it("should render Image if icon is not a string", () => {
    const iconImage = 1;
    const component = renderComponent({
      ...textInputProps,
      iconPosition,
      icon: iconImage
    });
    expect(component.queryByTestId("ButtonDefaultOpacity")).not.toBeNull();
    expect(isString(iconImage)).toBeFalsy();
    expect(component.queryByTestId("LabelledItem_Image")).not.toBeNull();
  });

  it("should call onPress if is defined and ButtonDefaultOpacity is pressed", () => {
    const component = renderComponent({
      ...textInputProps,
      iconPosition,
      icon,
      onPress
    });
    const buttonDefaultOpacity = component.getByTestId("ButtonDefaultOpacity");
    expect(buttonDefaultOpacity).not.toBeNull();
    fireEvent.press(buttonDefaultOpacity);
    expect(onPress).toHaveBeenCalled();
  });

  it("should have red description color if isValid is false", () => {
    const component = renderComponent({
      ...textInputProps,
      description,
      isValid: false
    });
    expect(component.queryByTestId("description")).not.toBeNull();
    expect(component.queryByText(description)).toBeTruthy();
    expect(component.getByTestId("H5-description").props.color).toBe("red");
  });

  it("should have bluegreyDark description color if isValid is true", () => {
    const component = renderComponent({
      ...textInputProps,
      description,
      isValid: true
    });
    expect(component.queryByTestId("description")).not.toBeNull();
    expect(component.queryByText(description)).toBeTruthy();
    expect(component.getByTestId("H5-description").props.color).toBe(
      "bluegreyDark"
    );
  });

  it("should have the correct borderColor if focusBorderColor is defined", () => {
    const focusBorderColor = "red";
    const component = renderComponent({ ...textInputProps, focusBorderColor });
    const itemComponent = component.getByTestId("Item");
    expect(itemComponent).not.toBeNull();
    expect(itemComponent).toHaveStyle({
      borderColor: focusBorderColor
    });
  });
});

const renderComponent = (props: Props) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenFakeNavRedux(
    () => <LabelledItem {...props} />,
    "DUMMY",
    {},
    store
  );
};
