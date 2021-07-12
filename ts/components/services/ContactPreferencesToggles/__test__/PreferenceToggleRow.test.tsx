import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import PreferenceToggleRow from "../PreferenceToggleRow";

describe("PreferenceToggleRow component", () => {
  const options: Partial<Parameters<typeof PreferenceToggleRow>[0]> = {
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

  describe("handle different status", () => {
    it("should display activity indicator", () => {
      const component = renderComponent({
        ...options,
        graphicalState: "loading"
      });

      expect(
        component.getByTestId("preference-toggle-row-loading")
      ).toBeDefined();
    });

    it("should display reload button", () => {
      const spy = jest.fn();
      const component = renderComponent({
        ...options,
        graphicalState: "error",
        onReload: spy
      });
      const reloadComponent = component.getByTestId(
        "preference-toggle-row-reload"
      );
      expect(reloadComponent).toBeDefined();
      fireEvent.press(reloadComponent);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should display switch disabled", () => {
      const component = renderComponent({
        ...options,
        graphicalState: "ready",
        disabled: true
      });
      expect(component.getByTestId("preference-toggle-row")).toBeDefined();
      const switchComponent = component.getByRole("switch");
      expect(switchComponent).toBeDefined();
      expect(switchComponent).toBeDisabled();
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
      graphicalState={"ready"}
      onPress={onPress}
      onReload={onReload}
      {...options}
    />
  );
}
