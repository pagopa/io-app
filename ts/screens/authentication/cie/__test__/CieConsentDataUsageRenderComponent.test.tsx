import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import CieConsentDataUsageRenderComponent from "../components/CieConsentDataUsageRenderComponent";
import ROUTES from "../../../../navigation/routes";
import I18n from "../../../../i18n";

describe("CieConsentDataUsageRenderComponent", () => {
  test("renders LoaderComponent when isLoginSuccess is true", () => {
    const LoaderComponent = jest.fn().mockReturnValue(null);
    const props = {
      isLoginSuccess: true,
      LoaderComponent,
      hasError: false,
      cieConsentUri: "some-uri",
      originSchemasWhiteList: [],
      handleShouldStartLoading: jest.fn(),
      handleWebViewError: jest.fn(),
      handleHttpError: jest.fn(),
      onRetry: jest.fn(),
      onCancel: jest.fn()
    };

    render(<CieConsentDataUsageRenderComponent {...props} />);

    expect(LoaderComponent).toHaveBeenCalled();
  });

  test('renders AuthErrorScreen when hasError is true and errorCode is not "1002"', () => {
    const props = {
      isLoginSuccess: false,
      LoaderComponent: jest.fn().mockReturnValue(null),
      hasError: true,
      errorCode: "200",
      cieConsentUri: "some-uri",
      originSchemasWhiteList: [],
      handleShouldStartLoading: jest.fn(),
      handleWebViewError: jest.fn(),
      handleHttpError: jest.fn(),
      onRetry: jest.fn(),
      onCancel: jest.fn()
    };

    const { getByText } = render(
      <NavigationContainer
        initialState={{
          routes: [{ name: ROUTES.CIE_CONSENT_DATA_USAGE }],
          index: 0
        }}
      >
        <CieConsentDataUsageRenderComponent {...props} />
      </NavigationContainer>
    );
    expect(
      getByText(I18n.t("authentication.cie_errors.generic.title"))
    ).toBeTruthy();
  });

  test("renders WebView when hasError is false", () => {
    const props = {
      isLoginSuccess: false,
      LoaderComponent: jest.fn().mockReturnValue(null),
      hasError: false,
      cieConsentUri: "some-uri",
      originSchemasWhiteList: [],
      handleShouldStartLoading: jest.fn(),
      handleWebViewError: jest.fn(),
      handleHttpError: jest.fn(),
      onRetry: jest.fn(),
      onCancel: jest.fn()
    };

    const { getByTestId } = render(
      <CieConsentDataUsageRenderComponent {...props} />
    );

    expect(getByTestId("webview-cie-test")).toBeTruthy();
  });
});
