import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import AuthErrorScreen from "../components/AuthErrorScreen";
import I18n from "../../../../i18n";

describe("AuthErrorScreen", () => {
  test("renders correctly with default error code", () => {
    const onRetryMock = jest.fn();
    const onCancelMock = jest.fn();

    const { getByText } = render(
      <AuthErrorScreen onRetry={onRetryMock} onCancel={onCancelMock} />
    );

    expect(
      getByText(I18n.t("authentication.cie_errors.generic.title"))
    ).toBeDefined();
    expect(
      getByText(I18n.t("authentication.cie_errors.generic.subtitle"))
    ).toBeDefined();
    fireEvent.press(getByText(I18n.t("global.buttons.retry")));
    fireEvent.press(getByText(I18n.t("global.buttons.close")));
    expect(onRetryMock).toHaveBeenCalled();
    expect(onCancelMock).toHaveBeenCalled();
  });

  test('renders correctly with error code "22"', () => {
    const onRetryMock = jest.fn();
    const onCancelMock = jest.fn();

    const { getByText } = render(
      <AuthErrorScreen
        errorCode="22"
        onRetry={onRetryMock}
        onCancel={onCancelMock}
      />
    );

    expect(
      getByText(I18n.t("authentication.cie_errors.error_22.title"))
    ).toBeDefined();
    expect(
      getByText(I18n.t("authentication.cie_errors.error_22.subtitle"))
    ).toBeDefined();
    fireEvent.press(getByText(I18n.t("global.buttons.retry")));
    fireEvent.press(getByText(I18n.t("global.buttons.close")));
    expect(onRetryMock).toHaveBeenCalled();
    expect(onCancelMock).toHaveBeenCalled();
  });

  test('renders correctly with error code "1001"', () => {
    const onRetryMock = jest.fn();
    const onCancelMock = jest.fn();

    const { getByText } = render(
      <AuthErrorScreen
        errorCode="1001"
        onRetry={onRetryMock}
        onCancel={onCancelMock}
      />
    );

    expect(
      getByText(I18n.t("authentication.cie_errors.error_1001.title"))
    ).toBeDefined();
    expect(
      getByText(I18n.t("authentication.cie_errors.error_1001.subtitle"))
    ).toBeDefined();
    fireEvent.press(getByText(I18n.t("global.buttons.retry")));
    expect(onRetryMock).toHaveBeenCalled();
  });
});
