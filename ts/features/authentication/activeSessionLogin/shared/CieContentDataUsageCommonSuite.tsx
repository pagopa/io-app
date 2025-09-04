import { fireEvent, RenderAPI, waitFor } from "@testing-library/react-native";
import type { WebViewHttpErrorEvent } from "react-native-webview/lib/WebViewTypes";

export type ConsentSuiteConfig = {
  name: string; // "standard" | "active-session"
  render: () => RenderAPI; // funzione che renderizza la screen giusta
  mockNavigation: { navigate: jest.Mock; replace: jest.Mock }; // restituita dal tuo mock di useIONavigation
  onLoginUriChangedSpy: jest.SpyInstance; // spy settato nel test caller sul modulo giusto
  makeHttpError: () => WebViewHttpErrorEvent; // builder per l'evento http error
  expectErrorRedirectMethod: "navigate" | "replace"; // differenza chiave tra le due screen
};

const callNavigationError = (cfg: ConsentSuiteConfig) => {
  if (cfg.expectErrorRedirectMethod === "replace") {
    expect(cfg.mockNavigation.replace).toHaveBeenCalled();
  } else {
    expect(cfg.mockNavigation.navigate).toHaveBeenCalled();
  }
};

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

    it("handles WebView onError -> triggers error redirect", async () => {
      const { getByTestId } = cfg.render();
      const webView = getByTestId("webview-cie-test");
      fireEvent(webView, "onError");
      await waitFor(() => callNavigationError(cfg));
    });

    it("handles WebView onHttpError -> dispatches failure and redirect", async () => {
      const { getByTestId } = cfg.render();
      const webView = getByTestId("webview-cie-test");
      fireEvent(webView, "onHttpError", cfg.makeHttpError());
      await waitFor(() => callNavigationError(cfg));
    });
  });
};
