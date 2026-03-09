import { fireEvent, RenderAPI } from "@testing-library/react-native";
import type { WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";

// Configuration for the consent screen test suite
export type ConsentSuiteConfig = {
  name: string; // "standard" | "active-session"
  render: () => RenderAPI; // function that renders the correct screen
  mockNavigation: { navigate: jest.Mock; replace: jest.Mock }; // returned by your useIONavigation mock
  onLoginUriChangedSpy: jest.SpyInstance; // spy set in the test caller on the correct module
  makeHttpError: () => WebViewHttpErrorEvent; // builder for the http error event
  expectErrorRedirectMethod: "navigate" | "replace"; // key difference between the two screens
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
  });
};
