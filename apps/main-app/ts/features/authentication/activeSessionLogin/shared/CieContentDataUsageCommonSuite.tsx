import type { WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";

import { StackActions } from "@react-navigation/native";
import { act, fireEvent, RenderAPI } from "@testing-library/react-native";

import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";

// Configuration for the consent screen test suite
export type ConsentSuiteConfig = {
  makeHttpError: () => WebViewHttpErrorEvent; // builder for the http error event
  mockNavigation: {
    dispatch: jest.Mock;
    navigate: jest.Mock;
    replace: jest.Mock;
  }; // returned by your useIONavigation mock
  name: string; // "standard" | "active-session"
  onLoginUriChangedSpy: jest.SpyInstance; // spy set in the test caller on the correct module
  render: () => RenderAPI; // function that renders the correct screen
};

// Runs the test suite for the consent screen
export const runConsentScreenSuite = (cfg: ConsentSuiteConfig) => {
  describe(`CIE Consent WebView (${cfg.name})`, () => {
    it("renders and shows WebView", () => {
      const { getByTestId } = cfg.render();
      expect(getByTestId("webview-cie-test")).toBeTruthy();
    });

    it("blocks token URL when onLoginUriChanged returns true", () => {
      const { getByTestId } = cfg.render();
      const webView = getByTestId("webview-cie-test");
      fireEvent(webView, "onShouldStartLoadWithRequest", {
        url: "https://fake.url/login?token=abc"
      });
      expect(cfg.onLoginUriChangedSpy).toHaveBeenCalled();
    });

    it("allows loading when onLoginUriChanged returns false", () => {
      const { getByTestId } = cfg.render();
      const webView = getByTestId("webview-cie-test");
      fireEvent(webView, "onShouldStartLoadWithRequest", {
        url: "https://other.url"
      });
      expect(cfg.onLoginUriChangedSpy).toHaveBeenCalled();
    });

    it("replaces locally the consent webview with AuthErrorScreen on a WebView error, without touching MAIN", () => {
      cfg.mockNavigation.dispatch.mockClear();
      cfg.mockNavigation.navigate.mockClear();
      cfg.mockNavigation.replace.mockClear();

      const { getByTestId } = cfg.render();
      act(() => {
        fireEvent(getByTestId("webview-cie-test"), "error", {
          nativeEvent: {}
        });
      });

      expect(cfg.mockNavigation.dispatch).toHaveBeenCalledWith(
        StackActions.replace(AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN, {
          errorCodeOrMessage: undefined,
          authMethod: "CIE",
          authLevel: "L2"
        })
      );
      expect(cfg.mockNavigation.navigate).not.toHaveBeenCalled();
      expect(cfg.mockNavigation.replace).not.toHaveBeenCalled();
    });
  });
};
