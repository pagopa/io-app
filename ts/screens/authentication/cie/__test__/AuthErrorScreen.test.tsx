import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import AuthErrorScreen from "../components/AuthErrorScreen";
import I18n from "../../../../i18n";

describe("AuthErrorScreen", () => {
  const testCases = [
    {
      description: "renders correctly with generic error code",
      errorCode: "generic",
      expectedTitle: I18n.t("authentication.cie_errors.generic.title"),
      expectedSubtitle: I18n.t("authentication.cie_errors.generic.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "22"',
      errorCode: "22",
      expectedTitle: I18n.t("authentication.cie_errors.error_22.title"),
      expectedSubtitle: I18n.t("authentication.cie_errors.error_22.subtitle"),
      expectRetryCalled: true,
      expectCancelCalled: true
    },
    {
      description: 'renders correctly with error code "1001"',
      errorCode: "1001",
      expectedTitle: I18n.t("authentication.cie_errors.error_1001.title"),
      expectedSubtitle: I18n.t("authentication.cie_errors.error_1001.subtitle"),
      expectRetryCalled: false,
      expectCancelCalled: true
    }
  ];

  testCases.forEach(
    ({
      description,
      errorCode,
      expectedTitle,
      expectedSubtitle,
      expectRetryCalled,
      expectCancelCalled
    }) => {
      test(description, () => {
        const onRetryMock = jest.fn();
        const onCancelMock = jest.fn();

        const { getByText } = render(
          <AuthErrorScreen
            errorCode={errorCode}
            onRetry={onRetryMock}
            onCancel={onCancelMock}
          />
        );

        expect(getByText(expectedTitle)).toBeDefined();
        expect(getByText(expectedSubtitle)).toBeDefined();

        if (expectRetryCalled) {
          fireEvent.press(getByText(I18n.t("global.buttons.retry")));
          expect(onRetryMock).toHaveBeenCalled();
        }

        if (expectCancelCalled) {
          fireEvent.press(getByText(I18n.t("global.buttons.close")));
          expect(onCancelMock).toHaveBeenCalled();
        }
      });
    }
  );
});
