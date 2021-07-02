import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import PreferenceToggleRow from "../PreferenceToggleRow";

describe("PreferenceToggleRow component", () => {
  const options = {
    label: "Push Notifications",
    value: true,
    onPress: jest.fn()
  };
  it("should match the snapshot", () => {
    const component = renderComponent(options);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should show the label", () => {
    const component = renderComponent(options);
    expect(component.getByText("Push Notifications")).toBeDefined();
  });
  it("should expose a working switch", () => {
    const component = renderComponent(options);
    const switchComponent = component.getByRole("switch");
    expect(switchComponent).toBeDefined();
    fireEvent(switchComponent, "onValueChange", false);
    expect(options.onPress).toHaveBeenCalledWith(false);
  });
  it("should use a default testID", () => {
    const component = renderComponent(options);
    expect(component.getByTestId("preference-toggle-row")).toBeDefined();
  });
  describe("when a testID is passed", () => {
    it("should honour the property", () => {
      const component = renderComponent({ ...options, testID: "new-test-id" });
      expect(component.getByTestId("new-test-id")).toBeDefined();
    });
  });
});

function renderComponent(
  options: Partial<Parameters<typeof PreferenceToggleRow>[0]>
) {
  const onPress = jest.fn();
  const onReload = jest.fn();
  return render(
    <PreferenceToggleRow
      label="default label"
      value={true}
      isLoading={false}
      isError={false}
      onPress={onPress}
      onReload={onReload}
      {...options}
    />
  );
}
