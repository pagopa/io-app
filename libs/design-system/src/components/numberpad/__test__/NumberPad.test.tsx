import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { AccessibilityInfo } from "react-native";

import { NumberPad } from "../NumberPad";

const mockOnDelete = jest.fn();
const mockOnNumberPress = jest.fn();
const mockOnBiometricPress = jest.fn();

describe("NumberPad", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("Should match the snapshot", () => {
    const component = renderNumberPad();
    expect(component).toMatchSnapshot();
  });
  it("Should properly call onNumberPress without side effects", () => {
    const { getByText } = renderNumberPad();
    const one = getByText("1");
    const nine = getByText("9");
    const reactCreatElement = jest.spyOn(React, "createElement");

    // Press one
    fireEvent.press(one);
    expect(mockOnNumberPress).toHaveBeenCalledTimes(1);
    expect(mockOnNumberPress).toHaveBeenCalledWith(1);
    mockOnNumberPress.mockClear();

    // Press nine
    fireEvent.press(nine);
    expect(mockOnNumberPress).toHaveBeenCalledTimes(1);
    expect(mockOnNumberPress).toHaveBeenCalledWith(9);

    expect(reactCreatElement).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(mockOnBiometricPress).not.toHaveBeenCalled();
  });
  it("Should properly call onDeletePress without side effects", () => {
    const { getByLabelText } = renderNumberPad();
    const deleteButton = getByLabelText("delete");
    const reactCreatElement = jest.spyOn(React, "createElement");
    const announceForAccessibility = jest.spyOn(
      AccessibilityInfo,
      "announceForAccessibility"
    );

    fireEvent.press(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(announceForAccessibility).toHaveBeenCalledWith(
      "Hai eliminato la cifra 2"
    );
    expect(reactCreatElement).not.toHaveBeenCalled();
    expect(mockOnNumberPress).not.toHaveBeenCalled();
    expect(mockOnBiometricPress).not.toHaveBeenCalled();
  });
  it("Should not announce a number when deleting from an empty value", () => {
    const { getByLabelText } = renderNumberPad("");
    const announceForAccessibility = jest.spyOn(
      AccessibilityInfo,
      "announceForAccessibility"
    );

    fireEvent.press(getByLabelText("delete"));

    expect(announceForAccessibility).not.toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
  it("Should properly call onBiometricPress without side effects", () => {
    const { getByLabelText } = renderNumberPad();
    const biometricButton = getByLabelText("touch id trigger");
    const reactCreatElement = jest.spyOn(React, "createElement");

    fireEvent.press(biometricButton);

    expect(mockOnBiometricPress).toHaveBeenCalledTimes(1);
    expect(reactCreatElement).not.toHaveBeenCalled();
    expect(mockOnNumberPress).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
  it("Should announce the pressed number", () => {
    const { getByText } = renderNumberPad();
    const announceForAccessibility = jest.spyOn(
      AccessibilityInfo,
      "announceForAccessibility"
    );

    fireEvent.press(getByText("1"));

    expect(announceForAccessibility).toHaveBeenCalledWith("1");
  });
});

function renderNumberPad(
  deleteAccessibilityAnnouncement = "Hai eliminato la cifra 2"
) {
  return render(
    <NumberPad
      biometricAccessibilityLabel="touch id trigger"
      biometricType="TOUCH_ID"
      deleteAccessibilityAnnouncement={deleteAccessibilityAnnouncement}
      deleteAccessibilityLabel="delete"
      onBiometricPress={mockOnBiometricPress}
      onDeletePress={mockOnDelete}
      onNumberPress={mockOnNumberPress}
    />
  );
}
