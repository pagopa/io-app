import { fireEvent, render } from "@testing-library/react-native";

import { ModuleIDP } from "../ModuleIDP";

const logo = {
  light: { uri: "https://example.com/idp-light.png" },
  dark: { uri: "https://example.com/idp-dark.png" }
};

describe("ModuleIDP", () => {
  it("should render the skeleton when isLoading is true", () => {
    const { getByLabelText, queryByText } = render(
      <ModuleIDP isLoading loadingAccessibilityLabel="loading idp" />
    );

    expect(getByLabelText("loading idp")).toBeBusy();
    expect(queryByText("Test IDP")).toBeNull();
  });

  it("should render the IDP name", () => {
    const { getByText } = render(
      <ModuleIDP logo={logo} name="Test IDP" onPress={jest.fn()} />
    );

    expect(getByText("Test IDP")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ModuleIDP
        logo={logo}
        name="Test IDP"
        onPress={onPress}
        testID="module-idp"
      />
    );

    fireEvent.press(getByTestId("module-idp"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should use the IDP name as the default accessibility label", () => {
    const { getByText } = render(
      <ModuleIDP logo={logo} name="Test IDP" onPress={jest.fn()} />
    );

    const element = getByText("Test IDP");
    expect(element.props.accessibilityLabel).toBe("Test IDP");
  });

  it("should use a custom accessibilityLabel when provided", () => {
    const { getByText } = render(
      <ModuleIDP
        accessibilityLabel="Custom label"
        logo={logo}
        name="Test IDP"
        onPress={jest.fn()}
      />
    );

    const element = getByText("Test IDP");
    expect(element.props.accessibilityLabel).toBe("Custom label");
  });
});
