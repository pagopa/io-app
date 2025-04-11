import { render, fireEvent } from "@testing-library/react-native";
import { IdentificationNumberPad } from "../IdentificationNumberPad";

describe("IdentificationNumberPad", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockPinValidation = jest.fn();
  const mockBiometricConfig = {
    biometricType: "FACE_ID" as const,
    biometricAccessibilityLabel: "Use Face ID",
    onBiometricPress: jest.fn()
  };

  it("should render the number pad and code input", () => {
    const { getByTestId } = render(
      <IdentificationNumberPad
        pin="123456"
        pinValidation={mockPinValidation}
        numberPadVariant="primary"
        biometricsConfig={mockBiometricConfig}
      />
    );

    expect(getByTestId("code-input")).toBeTruthy();
    expect(getByTestId("number-pad")).toBeTruthy();
  });

  it("should call biometric press handler", () => {
    const { getByLabelText } = render(
      <IdentificationNumberPad
        pin="123456"
        pinValidation={mockPinValidation}
        numberPadVariant="primary"
        biometricsConfig={mockBiometricConfig}
      />
    );

    const biometricButton = getByLabelText("Use Face ID");
    fireEvent.press(biometricButton);

    expect(mockBiometricConfig.onBiometricPress).toHaveBeenCalled();
  });

  it("should render all number pad buttons", () => {
    const { getByText, getByA11yLabel } = render(
      <IdentificationNumberPad
        pin="123456"
        pinValidation={mockPinValidation}
        numberPadVariant="primary"
        biometricsConfig={mockBiometricConfig}
      />
    );

    // Check for all number buttons
    // eslint-disable-next-line functional/no-let
    for (let i = 0; i <= 9; i++) {
      expect(getByText(i.toString())).toBeTruthy();
    }

    // Check for delete button
    expect(getByA11yLabel("Delete")).toBeTruthy();
  });

  it("should update successfully validate PIN if it's enter correctly", () => {
    const { getByText } = render(
      <IdentificationNumberPad
        pin="123456"
        pinValidation={mockPinValidation}
        numberPadVariant="primary"
        biometricsConfig={mockBiometricConfig}
      />
    );

    fireEvent.press(getByText("1"));
    fireEvent.press(getByText("2"));
    fireEvent.press(getByText("3"));
    fireEvent.press(getByText("4"));
    fireEvent.press(getByText("5"));
    fireEvent.press(getByText("6"));
    jest.advanceTimersByTime(250);
    expect(mockPinValidation).toHaveBeenCalledWith(true);
  });

  it("should update successfully validate PIN if it's wrong", () => {
    const { getByText } = render(
      <IdentificationNumberPad
        pin="123456"
        pinValidation={mockPinValidation}
        numberPadVariant="primary"
        biometricsConfig={mockBiometricConfig}
      />
    );

    fireEvent.press(getByText("1"));
    fireEvent.press(getByText("2"));
    fireEvent.press(getByText("3"));
    fireEvent.press(getByText("4"));
    fireEvent.press(getByText("5"));
    fireEvent.press(getByText("7"));
    jest.advanceTimersByTime(500);
    expect(mockPinValidation).toHaveBeenCalledWith(false);
  });
});
